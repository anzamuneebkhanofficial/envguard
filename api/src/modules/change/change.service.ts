import { changeRepository, type ChangeRepository } from './change.repository.js';
import { projectRepository } from '../project/project.repository.js';
import type { ChangeFilterQuery, PaginatedChangesResult, ChangeDTO, Change } from './change.types.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import { ForbiddenError } from '../../shared/errors/UnauthorizedError.js';
import type { AuthUserPayload } from '../../shared/types/express.d.js';

export class ChangeService {
  constructor(private readonly repo: ChangeRepository = changeRepository) {}

  private mapToDTO = (item: Change): ChangeDTO => {
    return {
      id: item._id.toString(),
      projectId: item.projectId.toString(),
      key: item.key,
      action: item.action,
      oldValue: item.oldValue,
      newValue: item.newValue,
      oldValueMasked: item.oldValueMasked,
      newValueMasked: item.newValueMasked,
      changedBy: item.changedBy,
      userName: item.userName || (item.changedBy ? item.changedBy.split('@')[0] : 'System'),
      userRole: item.userRole || 'Member',
      changedAt: item.changedAt,
      source: item.source,
    };
  };

  async list(
    projectId: string,
    filter: ChangeFilterQuery,
    user: AuthUserPayload
  ): Promise<PaginatedChangesResult> {
    const project = await projectRepository.findById(projectId);
    if (!project) throw new NotFoundError('Project not found');

    const isMember =
      String(project.ownerId) === String(user.userId) ||
      project.members.some((m) => String(m.userId) === String(user.userId));
    if (!isMember) throw new ForbiddenError('Access denied to project audit history');

    const defaultLimit = parseInt(process.env.HISTORY_PAGE_LIMIT || '8', 10);
    const limit = filter.limit && filter.limit > 0 ? Math.min(filter.limit, 100) : (isNaN(defaultLimit) ? 8 : defaultLimit);
    const page = filter.page && filter.page > 0 ? filter.page : 1;

    const { changes, total } = await this.repo.listPaginated(projectId, {
      ...filter,
      page,
      limit,
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      changes: changes.map(this.mapToDTO),
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  async getById(projectId: string, changeId: string, user: AuthUserPayload): Promise<ChangeDTO> {
    const project = await projectRepository.findById(projectId);
    if (!project) throw new NotFoundError('Project not found');

    const isMember =
      String(project.ownerId) === String(user.userId) ||
      project.members.some((m) => String(m.userId) === String(user.userId));
    if (!isMember) throw new ForbiddenError('Access denied to project audit history');

    const change = await this.repo.findById(changeId);
    if (!change || change.projectId.toString() !== projectId) {
      throw new NotFoundError('Change record not found');
    }

    return this.mapToDTO(change);
  }
}

export const changeService = new ChangeService();
