import { projectRepository, type ProjectRepository } from './project.repository.js';
import { authRepository } from '../auth/auth.repository.js';
import { changeRepository } from '../change/change.repository.js';
import type { CreateProjectInput, UpdateProjectInput, AddMemberInput } from './project.schema.js';
import type { ProjectDTO, Project, PaginatedProjectsResult } from './project.types.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import { ForbiddenError } from '../../shared/errors/UnauthorizedError.js';
import { ValidationError } from '../../shared/errors/ValidationError.js';
import { VariableModel } from '../variable/variable.repository.js';

export class ProjectService {
  constructor(private readonly repo: ProjectRepository = projectRepository) {}

  private async populateAndMapToDTO(
    project: Project,
    variableCount?: number,
    lastChangedAt?: Date | null
  ): Promise<ProjectDTO> {
    // If ownerName or ownerEmail missing, fetch from user model
    let ownerName = project.ownerName;
    let ownerEmail = project.ownerEmail;
    if (!ownerName || !ownerEmail) {
      const ownerUser = await authRepository.findById(project.ownerId.toString());
      if (ownerUser) {
        ownerName = ownerUser.name;
        ownerEmail = ownerUser.email;
      }
    }

    // Populate all members with accurate user names and emails
    const userIds = project.members.map((m) => m.userId.toString());
    const memberUsers = await Promise.all(
      userIds.map((id) => authRepository.findById(id))
    );
    const userMap = new Map<string, { name: string; email: string }>();
    memberUsers.forEach((u) => {
      if (u) {
        userMap.set(u._id.toString(), { name: u.name, email: u.email });
      }
    });

    return {
      id: project._id.toString(),
      name: project.name,
      description: project.description,
      ownerId: project.ownerId.toString(),
      ownerName: ownerName || 'Project Owner',
      ownerEmail: ownerEmail || '',
      isDeleted: project.isDeleted || false,
      deletedAt: project.deletedAt || null,
      deletedBy: project.deletedBy || null,
      deletionNote: project.deletionNote || null,
      members: project.members.map((m) => {
        const u = userMap.get(m.userId.toString());
        return {
          userId: m.userId.toString(),
          name: u?.name || m.name || (u?.email || m.email || '').split('@')[0] || 'Member',
          email: u?.email || m.email || '',
          role: m.role,
          invitedBy: m.invitedBy || 'Creator',
          invitedAt: m.invitedAt || project.createdAt,
        };
      }),
      variableCount: variableCount ?? 0,
      lastChangedAt: lastChangedAt ?? null,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }

  private checkPermission(project: Project, userId: string, requiredRole: 'viewer' | 'editor' | 'owner'): void {
    if (String(project.ownerId) === String(userId)) return;

    const member = project.members.find((m) => String(m.userId) === String(userId));
    if (!member) {
      throw new ForbiddenError('You do not have access to this project');
    }

    if (requiredRole === 'viewer') return;
    if (requiredRole === 'editor' && (member.role === 'editor' || member.role === 'owner')) return;
    if (requiredRole === 'owner' && member.role === 'owner') return;

    throw new ForbiddenError(`Insufficient permissions. Required role: ${requiredRole}`);
  }

  async create(userId: string, input: CreateProjectInput): Promise<ProjectDTO> {
    const existing = await this.repo.findByNameAndOwner(input.name, userId);
    if (existing) {
      throw new ValidationError(`A project named "${input.name}" already exists in your workspace`);
    }

    const creator = await authRepository.findById(userId);

    const created = await this.repo.create({
      name: input.name,
      description: input.description,
      ownerId: userId,
      ownerName: creator?.name || 'Owner',
      ownerEmail: creator?.email || '',
    });

    // Record project creation audit history
    await changeRepository.create({
      projectId: created._id.toString(),
      key: created.name,
      action: 'project_created',
      changedBy: creator?.email || 'owner',
      userName: creator?.name || 'Owner',
      userRole: 'Owner',
      source: 'dashboard',
    });

    return this.populateAndMapToDTO(created, 0, null);
  }

  async list(userId: string): Promise<ProjectDTO[]> {
    const projects = await this.repo.listForUser(userId);
    const dtos: ProjectDTO[] = [];

    for (const project of projects) {
      const varCount = await VariableModel.countDocuments({ projectId: project._id });
      const lastVar = await VariableModel.findOne({ projectId: project._id })
        .sort({ lastChangedAt: -1 })
        .lean()
        .exec();

      dtos.push(await this.populateAndMapToDTO(project, varCount, lastVar ? lastVar.lastChangedAt : null));
    }

    return dtos;
  }

  async listPaginated(
    userId: string,
    options: { search?: string; page?: number; limit?: number }
  ): Promise<PaginatedProjectsResult> {
    const defaultLimit = parseInt(process.env.PROJECTS_PAGE_LIMIT || '6', 10);
    const limit = options.limit && options.limit > 0 ? options.limit : (isNaN(defaultLimit) ? 6 : defaultLimit);
    const page = options.page && options.page > 0 ? options.page : 1;

    const { projects, total } = await this.repo.listForUserPaginated(userId, {
      search: options.search,
      page,
      limit,
    });

    const dtos: ProjectDTO[] = [];
    for (const project of projects) {
      const varCount = await VariableModel.countDocuments({ projectId: project._id });
      const lastVar = await VariableModel.findOne({ projectId: project._id })
        .sort({ lastChangedAt: -1 })
        .lean()
        .exec();

      dtos.push(await this.populateAndMapToDTO(project, varCount, lastVar ? lastVar.lastChangedAt : null));
    }

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      projects: dtos,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  async getById(projectId: string, userId: string): Promise<ProjectDTO> {
    const project = await this.repo.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }
    this.checkPermission(project, userId, 'viewer');

    const varCount = await VariableModel.countDocuments({ projectId: project._id });
    const lastVar = await VariableModel.findOne({ projectId: project._id })
      .sort({ lastChangedAt: -1 })
      .lean()
      .exec();

    return this.populateAndMapToDTO(project, varCount, lastVar ? lastVar.lastChangedAt : null);
  }

  async update(projectId: string, userId: string, input: UpdateProjectInput): Promise<ProjectDTO> {
    const project = await this.repo.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }
    this.checkPermission(project, userId, 'owner');

    const updated = await this.repo.update(projectId, input);
    if (!updated) {
      throw new NotFoundError('Failed to update project');
    }

    const updater = await authRepository.findById(userId);

    // Record audit event for project metadata change
    await changeRepository.create({
      projectId,
      key: input.name || project.name,
      action: 'updated',
      changedBy: updater?.email || 'owner',
      userName: updater?.name || 'Owner',
      userRole: 'Owner',
      newValueMasked: `Name: ${input.name || project.name}`,
      source: 'dashboard',
    });

    return this.populateAndMapToDTO(updated);
  }

  async delete(projectId: string, userId: string, note?: string): Promise<void> {
    const project = await this.repo.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }
    this.checkPermission(project, userId, 'owner');

    const user = await authRepository.findById(userId);
    const userEmail = user?.email || 'owner';

    // Soft delete project to remove from active workspace while preserving audit trail
    const success = await this.repo.softDelete(projectId, userEmail, note);
    if (!success) {
      throw new NotFoundError('Project could not be deleted');
    }

    // Record deletion event in audit history
    await changeRepository.create({
      projectId,
      key: project.name,
      action: 'project_deleted',
      oldValueMasked: note ? `Reason: ${note}` : 'Removed by owner',
      newValueMasked: 'Status: Inactive/Archived',
      changedBy: userEmail,
      userName: user?.name || 'Owner',
      userRole: 'Owner',
      source: 'dashboard',
    });
  }

  async addMember(projectId: string, currentUserId: string, input: AddMemberInput): Promise<ProjectDTO> {
    const project = await this.repo.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }
    this.checkPermission(project, currentUserId, 'owner');

    const inviter = await authRepository.findById(currentUserId);
    const userToInvite = await authRepository.findByEmail(input.email);
    if (!userToInvite) {
      throw new NotFoundError(`No user found with email ${input.email}`);
    }

    const updated = await this.repo.addMember(projectId, {
      userId: userToInvite._id.toString(),
      name: userToInvite.name,
      email: userToInvite.email,
      role: input.role,
      invitedBy: inviter?.name || inviter?.email || 'Project Owner',
    });

    if (!updated) {
      throw new NotFoundError('Failed to add member to project');
    }

    // Record audit event for member invitation
    await changeRepository.create({
      projectId,
      key: userToInvite.email,
      action: 'member_invited',
      changedBy: inviter?.email || 'owner',
      userName: inviter?.name || 'Owner',
      userRole: 'Owner',
      newValueMasked: `Role: ${input.role.toUpperCase()}`,
      source: 'dashboard',
    });

    return this.populateAndMapToDTO(updated);
  }

  async removeMember(projectId: string, currentUserId: string, targetUserId: string): Promise<ProjectDTO> {
    const project = await this.repo.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }
    this.checkPermission(project, currentUserId, 'owner');

    if (String(project.ownerId) === String(targetUserId)) {
      throw new ValidationError('Project owner cannot be removed from project');
    }

    const removedUser = await authRepository.findById(targetUserId);
    const ownerUser = await authRepository.findById(currentUserId);

    const updated = await this.repo.removeMember(projectId, targetUserId);
    if (!updated) {
      throw new NotFoundError('Failed to remove member from project');
    }

    // Record member removal in audit history
    await changeRepository.create({
      projectId,
      key: removedUser?.email || targetUserId,
      action: 'deleted',
      changedBy: ownerUser?.email || 'owner',
      userName: ownerUser?.name || 'Owner',
      userRole: 'Owner',
      oldValueMasked: `Revoked: ${removedUser?.name || 'Member'} (${removedUser?.email || targetUserId})`,
      source: 'dashboard',
    });

    return this.populateAndMapToDTO(updated);
  }
}

export const projectService = new ProjectService();
