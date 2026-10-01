import mongoose, { Schema, Types, Model } from 'mongoose';
import type { Project, ProjectMember } from './project.types.js';

const memberSchema = new Schema<ProjectMember>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    role: { type: String, enum: ['owner', 'editor', 'viewer'], required: true },
    invitedBy: { type: String, default: '' },
    invitedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const projectMongooseSchema = new Schema<Project>(
  {
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, default: '', trim: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    ownerName: { type: String, default: '' },
    ownerEmail: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: String, default: null },
    deletionNote: { type: String, default: null },
    members: { type: [memberSchema], default: [] },
  },
  { timestamps: true }
);

// Compound index for user project lookups
projectMongooseSchema.index({ 'members.userId': 1 });

export const ProjectModel: Model<Project> =
  (mongoose.models.Project as Model<Project>) || mongoose.model<Project>('Project', projectMongooseSchema);

export class ProjectRepository {
  async findById(id: string): Promise<Project | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return ProjectModel.findById(id).lean<Project>().exec();
  }

  async findByNameAndOwner(name: string, ownerId: string): Promise<Project | null> {
    return ProjectModel.findOne({ name, ownerId: new Types.ObjectId(ownerId), isDeleted: { $ne: true } })
      .lean<Project>()
      .exec();
  }

  async listForUser(userId: string): Promise<Project[]> {
    if (!Types.ObjectId.isValid(userId)) return [];
    const userObjectId = new Types.ObjectId(userId);
    return ProjectModel.find({
      isDeleted: { $ne: true },
      $or: [
        { ownerId: userObjectId },
        { ownerId: userId },
        { 'members.userId': userObjectId },
        { 'members.userId': userId },
      ],
    })
      .sort({ updatedAt: -1 })
      .lean<Project[]>()
      .exec();
  }

  async listForUserPaginated(
    userId: string,
    options: { search?: string; page?: number; limit?: number }
  ): Promise<{ projects: Project[]; total: number }> {
    if (!Types.ObjectId.isValid(userId)) return { projects: [], total: 0 };
    const userObjectId = new Types.ObjectId(userId);
    const query: Record<string, unknown> = {
      isDeleted: { $ne: true },
      $or: [
        { ownerId: userObjectId },
        { ownerId: userId },
        { 'members.userId': userObjectId },
        { 'members.userId': userId },
      ],
    };

    if (options.search && options.search.trim()) {
      query.name = { $regex: options.search.trim(), $options: 'i' };
    }

    const defaultLimit = parseInt(process.env.PROJECTS_PAGE_LIMIT || '6', 10);
    const limit = options.limit && options.limit > 0 ? options.limit : (isNaN(defaultLimit) ? 6 : defaultLimit);
    const page = options.page && options.page > 0 ? options.page : 1;
    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      ProjectModel.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<Project[]>()
        .exec(),
      ProjectModel.countDocuments(query),
    ]);

    return { projects, total };
  }

  async create(data: {
    name: string;
    description: string;
    ownerId: string;
    ownerName?: string;
    ownerEmail?: string;
  }): Promise<Project> {
    const ownerObjectId = new Types.ObjectId(data.ownerId);
    const doc = await ProjectModel.create({
      name: data.name,
      description: data.description,
      ownerId: ownerObjectId,
      ownerName: data.ownerName || '',
      ownerEmail: data.ownerEmail || '',
      isDeleted: false,
      members: [
        {
          userId: ownerObjectId,
          name: data.ownerName || '',
          email: data.ownerEmail || '',
          role: 'owner',
          invitedBy: 'Creator',
          invitedAt: new Date(),
        },
      ],
    });
    return doc.toObject();
  }

  async update(id: string, data: Partial<{ name: string; description: string }>): Promise<Project | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return ProjectModel.findByIdAndUpdate(id, { $set: data }, { new: true }).lean<Project>().exec();
  }

  async softDelete(id: string, deletedByEmail: string, deletionNote?: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const res = await ProjectModel.findByIdAndUpdate(
      id,
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: deletedByEmail,
          deletionNote: deletionNote || 'Project closed by owner',
        },
      },
      { new: true }
    ).exec();
    return !!res;
  }

  async addMember(
    projectId: string,
    member: {
      userId: string;
      name?: string;
      email: string;
      role: 'owner' | 'editor' | 'viewer';
      invitedBy: string;
    }
  ): Promise<Project | null> {
    if (!Types.ObjectId.isValid(projectId) || !Types.ObjectId.isValid(member.userId)) return null;
    const userObjectId = new Types.ObjectId(member.userId);

    // Remove existing membership if any, then push new role and metadata
    await ProjectModel.findByIdAndUpdate(projectId, {
      $pull: { members: { userId: userObjectId } },
    });

    return ProjectModel.findByIdAndUpdate(
      projectId,
      {
        $push: {
          members: {
            userId: userObjectId,
            name: member.name || '',
            email: member.email,
            role: member.role,
            invitedBy: member.invitedBy,
            invitedAt: new Date(),
          },
        },
      },
      { new: true }
    ).lean<Project>().exec();
  }

  async removeMember(projectId: string, userId: string): Promise<Project | null> {
    if (!Types.ObjectId.isValid(projectId) || !Types.ObjectId.isValid(userId)) return null;
    const userObjectId = new Types.ObjectId(userId);
    return ProjectModel.findByIdAndUpdate(
      projectId,
      { $pull: { members: { userId: userObjectId } } },
      { new: true }
    )
      .lean<Project>()
      .exec();
  }
}

export const projectRepository = new ProjectRepository();
