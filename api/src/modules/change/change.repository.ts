import mongoose, { Schema, Types, Model } from 'mongoose';
import type { Change, ChangeFilterQuery } from './change.types.js';

const changeMongooseSchema = new Schema<Change>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    key: { type: String, required: true, index: true },
    action: {
      type: String,
      enum: [
        'created',
        'updated',
        'deleted',
        'synced',
        'member_invited',
        'member_removed',
        'project_created',
        'project_deleted',
      ],
      required: true,
      index: true,
    },
    oldValue: { type: String },
    newValue: { type: String },
    oldValueMasked: { type: String },
    newValueMasked: { type: String },
    changedBy: { type: String, required: true },
    userName: { type: String, default: '' },
    userRole: { type: String, default: 'Member' },
    changedAt: { type: Date, default: Date.now },
    source: { type: String, enum: ['cli', 'dashboard'], required: true },
  },
  { timestamps: true }
);

// Compound indexes for timeline queries and filters
changeMongooseSchema.index({ projectId: 1, changedAt: -1 });
changeMongooseSchema.index({ projectId: 1, key: 1, changedAt: -1 });

// Configurable Activity Retention TTL index (default: 7 days)
const retentionDays = parseInt(process.env.ACTIVITY_RETENTION_DAYS || '7', 10);
const retentionSeconds = (isNaN(retentionDays) || retentionDays < 1 ? 7 : retentionDays) * 24 * 60 * 60;
changeMongooseSchema.index({ changedAt: 1 }, { expireAfterSeconds: retentionSeconds });

export const ChangeModel: Model<Change> =
  (mongoose.models.Change as Model<Change>) || mongoose.model<Change>('Change', changeMongooseSchema);

export class ChangeRepository {
  async create(data: {
    projectId: string;
    key: string;
    action: Change['action'];
    oldValue?: string;
    newValue?: string;
    oldValueMasked?: string;
    newValueMasked?: string;
    changedBy: string;
    userName?: string;
    userRole?: string;
    changedAt?: Date;
    source: 'cli' | 'dashboard';
  }): Promise<Change> {
    const doc = await ChangeModel.create({
      ...data,
      projectId: new Types.ObjectId(data.projectId),
      changedAt: data.changedAt || new Date(),
    });
    return doc.toObject();
  }

  async findById(changeId: string): Promise<Change | null> {
    if (!Types.ObjectId.isValid(changeId)) return null;
    return ChangeModel.findById(changeId).lean<Change>().exec();
  }

  async listPaginated(
    projectId: string,
    filter: ChangeFilterQuery
  ): Promise<{ changes: Change[]; total: number }> {
    if (!Types.ObjectId.isValid(projectId)) return { changes: [], total: 0 };

    const query: Record<string, unknown> = {
      projectId: new Types.ObjectId(projectId),
    };

    if (filter.key && filter.key.trim()) {
      // Case-insensitive substring match for variable names
      query.key = { $regex: filter.key.trim(), $options: 'i' };
    }
    if (filter.action) {
      query.action = filter.action;
    }
    if (filter.from || filter.to) {
      const dateFilter: Record<string, Date> = {};
      if (filter.from) dateFilter.$gte = new Date(filter.from);
      if (filter.to) dateFilter.$lte = new Date(filter.to);
      query.changedAt = dateFilter;
    }

    const defaultLimit = parseInt(process.env.HISTORY_PAGE_LIMIT || '8', 10);
    const limit = filter.limit || (isNaN(defaultLimit) ? 8 : defaultLimit);
    const page = filter.page || 1;
    const skip = (page - 1) * limit;

    const [changes, total] = await Promise.all([
      ChangeModel.find(query)
        .sort({ changedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<Change[]>()
        .exec(),
      ChangeModel.countDocuments(query),
    ]);

    return { changes, total };
  }

  async cleanupExpired(): Promise<number> {
    const days = parseInt(process.env.ACTIVITY_RETENTION_DAYS || '7', 10);
    const validDays = isNaN(days) || days < 1 ? 7 : days;
    const cutoff = new Date(Date.now() - validDays * 24 * 60 * 60 * 1000);
    const res = await ChangeModel.deleteMany({ changedAt: { $lt: cutoff } });
    return res.deletedCount || 0;
  }
}

export const changeRepository = new ChangeRepository();
