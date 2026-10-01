import { variableRepository, type VariableRepository } from './variable.repository.js';
import { projectRepository } from '../project/project.repository.js';
import { changeRepository } from '../change/change.repository.js';
import { alertService } from '../alert/alert.service.js';
import type { SyncVariablesInput, UpdateVariableInput } from './variable.schema.js';
import type { VariableDTO, SyncDiffResult, Variable, PaginatedVariablesResult } from './variable.types.js';
import { maskSecret, computeFingerprint } from '../../shared/utils/hash.js';
import { SENSITIVE_KEY_PATTERNS } from '../../config/constants.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import { ForbiddenError } from '../../shared/errors/UnauthorizedError.js';
import type { AuthUserPayload } from '../../shared/types/express.d.js';

export class VariableService {
  constructor(private readonly repo: VariableRepository = variableRepository) {}

  private isKeyPatternCritical(key: string): boolean {
    return SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
  }

  private mapToDTO(item: Variable): VariableDTO {
    return {
      id: item._id.toString(),
      projectId: item.projectId.toString(),
      key: item.key,
      value: item.value,
      maskedValue: item.maskedValue || maskSecret(item.value),
      isCritical: item.isCritical,
      lastChangedBy: item.lastChangedBy,
      lastChangedAt: item.lastChangedAt,
    };
  }

  generateEnvExample(variables: Array<{ key: string }>): string {
    const sorted = [...variables].sort((a, b) => a.key.localeCompare(b.key));
    if (sorted.length === 0) return '';
    return sorted.map((v) => `${v.key}=`).join('\n') + '\n';
  }

  async list(projectId: string, user: AuthUserPayload): Promise<VariableDTO[]> {
    const project = await projectRepository.findById(projectId);
    if (!project) throw new NotFoundError('Project not found');

    const isMember =
      String(project.ownerId) === String(user.userId) ||
      project.members.some((m) => String(m.userId) === String(user.userId));
    if (!isMember) throw new ForbiddenError('Access denied to project variables');

    const variables = await this.repo.listByProject(projectId);
    return variables.map(this.mapToDTO);
  }

  async listPaginated(
    projectId: string,
    user: AuthUserPayload,
    options: { search?: string; page?: number; limit?: number }
  ): Promise<PaginatedVariablesResult> {
    const project = await projectRepository.findById(projectId);
    if (!project) throw new NotFoundError('Project not found');

    const isMember =
      String(project.ownerId) === String(user.userId) ||
      project.members.some((m) => String(m.userId) === String(user.userId));
    if (!isMember) throw new ForbiddenError('Access denied to project variables');

    const defaultLimit = parseInt(process.env.VARIABLES_PAGE_LIMIT || '10', 10);
    const limit = options.limit && options.limit > 0 ? options.limit : (isNaN(defaultLimit) ? 10 : defaultLimit);
    const page = options.page && options.page > 0 ? options.page : 1;

    const { variables, total } = await this.repo.listPaginated(projectId, {
      search: options.search,
      page,
      limit,
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      variables: variables.map(this.mapToDTO),
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  async sync(
    projectId: string,
    user: AuthUserPayload,
    input: SyncVariablesInput
  ): Promise<SyncDiffResult> {
    const project = await projectRepository.findById(projectId);
    if (!project) throw new NotFoundError('Project not found');

    const isOwnerOrEditor =
      String(project.ownerId) === String(user.userId) ||
      project.members.some(
        (m) =>
          String(m.userId) === String(user.userId) &&
          (m.role === 'editor' || m.role === 'owner')
      );
    if (!isOwnerOrEditor) {
      throw new ForbiddenError('You do not have permission to sync variables for this project');
    }

    const existingVars = await this.repo.listByProject(projectId);
    const existingMap = new Map<string, Variable>();
    for (const v of existingVars) {
      existingMap.set(v.key, v);
    }

    const incomingMap = new Map<string, string>();
    for (const item of input.variables) {
      incomingMap.set(item.key, item.value);
    }

    const isOwner = String(project.ownerId) === String(user.userId);
    const userMember = project.members.find((m) => String(m.userId) === String(user.userId));
    const userRole = isOwner ? 'Owner' : (userMember?.role === 'editor' ? 'Editor' : 'Member');
    const userName = user.name || (user.email ? user.email.split('@')[0] : 'User');

    let addedCount = 0;
    let updatedCount = 0;
    let unchangedCount = 0;

    const diffChanges: SyncDiffResult['changes'] = [];
    const now = new Date();

    // 1. Process incoming variables (add new, or update if value changed)
    for (const [key, rawValue] of incomingMap.entries()) {
      const masked = maskSecret(rawValue);
      const fingerprint = computeFingerprint(rawValue);
      const existing = existingMap.get(key);

      if (!existing) {
        // Created / Added
        const isCritical = this.isKeyPatternCritical(key);
        await this.repo.upsert({
          projectId,
          key,
          value: rawValue,
          maskedValue: masked,
          fingerprint,
          isCritical,
          lastChangedBy: user.email,
          lastChangedAt: now,
        });

        await changeRepository.create({
          projectId,
          key,
          action: 'created',
          oldValue: '',
          newValue: rawValue,
          oldValueMasked: '',
          newValueMasked: masked,
          changedBy: user.email,
          userName,
          userRole,
          changedAt: now,
          source: input.source,
        });

        if (isCritical) {
          await alertService.triggerCriticalAlert({
            project: project.name,
            key,
            action: 'created',
            changedBy: user.email,
            changedAt: now.toISOString(),
          }, projectId);
        }

        diffChanges.push({
          key,
          action: 'created',
          oldValue: '',
          newValue: rawValue,
          oldValueMasked: '',
          newValueMasked: masked,
          isCritical,
        });
        addedCount++;
      } else {
        // Exists: Check if value/fingerprint changed
        const valueChanged = existing.fingerprint !== fingerprint;

        if (valueChanged) {
          const isCritical = existing.isCritical || this.isKeyPatternCritical(key);
          await this.repo.upsert({
            projectId,
            key,
            value: rawValue,
            maskedValue: masked,
            fingerprint,
            isCritical,
            lastChangedBy: user.email,
            lastChangedAt: now,
          });

          await changeRepository.create({
            projectId,
            key,
            action: 'updated',
            oldValue: existing.value,
            newValue: rawValue,
            oldValueMasked: existing.maskedValue || existing.value,
            newValueMasked: masked,
            changedBy: user.email,
            userName,
            userRole,
            changedAt: now,
            source: input.source,
          });

          if (isCritical) {
            await alertService.triggerCriticalAlert({
              project: project.name,
              key,
              action: 'updated',
              changedBy: user.email,
              changedAt: now.toISOString(),
            }, projectId);
          }

          diffChanges.push({
            key,
            action: 'updated',
            oldValue: existing.value,
            newValue: rawValue,
            oldValueMasked: existing.maskedValue || maskSecret(existing.value),
            newValueMasked: masked,
            isCritical,
          });
          updatedCount++;
        } else {
          unchangedCount++;
        }
      }
    }

    // 2. Count existing variables that were NOT in incomingMap as unchanged (NEVER deleted on sync!)
    for (const key of existingMap.keys()) {
      if (!incomingMap.has(key)) {
        unchangedCount++;
      }
    }

    const currentVariables = await this.repo.listByProject(projectId);
    const envExample = this.generateEnvExample(currentVariables);

    return {
      added: addedCount,
      updated: updatedCount,
      deleted: 0,
      unchanged: unchangedCount,
      changes: diffChanges,
      envExample,
    };
  }

  async update(
    projectId: string,
    key: string,
    user: AuthUserPayload,
    input: UpdateVariableInput
  ): Promise<VariableDTO> {
    const project = await projectRepository.findById(projectId);
    if (!project) throw new NotFoundError('Project not found');

    const isOwnerOrEditor =
      String(project.ownerId) === String(user.userId) ||
      project.members.some(
        (m) =>
          String(m.userId) === String(user.userId) &&
          (m.role === 'editor' || m.role === 'owner')
      );
    if (!isOwnerOrEditor) {
      throw new ForbiddenError('You do not have permission to update variables in this project');
    }

    const existing = await this.repo.findByKey(projectId, key);
    if (!existing) throw new NotFoundError(`Variable ${key} not found`);

    const isOwner = String(project.ownerId) === String(user.userId);
    const userMember = project.members.find((m) => String(m.userId) === String(user.userId));
    const userRole = isOwner ? 'Owner' : (userMember?.role === 'editor' ? 'Editor' : 'Member');
    const userName = user.name || (user.email ? user.email.split('@')[0] : 'User');

    const now = new Date();
    let newValueActual = existing.value;
    let newValueMasked = existing.maskedValue || maskSecret(existing.value);
    let newFingerprint = existing.fingerprint ?? '';
    const isCritical = input.isCritical !== undefined ? input.isCritical : existing.isCritical;

    if (input.value !== undefined) {
      newValueActual = input.value;
      newValueMasked = maskSecret(input.value);
      newFingerprint = computeFingerprint(input.value);

      await changeRepository.create({
        projectId,
        key,
        action: 'updated',
        oldValue: existing.value,
        newValue: input.value,
        oldValueMasked: existing.maskedValue || existing.value,
        newValueMasked,
        changedBy: user.email,
        userName,
        userRole,
        changedAt: now,
        source: 'dashboard',
      });

      if (isCritical) {
        await alertService.triggerCriticalAlert({
          project: project.name,
          key,
          action: 'updated',
          changedBy: user.email,
          changedAt: now.toISOString(),
        }, projectId);
      }
    }

    const updated = await this.repo.upsert({
      projectId,
      key,
      value: newValueActual,
      maskedValue: newValueMasked,
      fingerprint: newFingerprint,
      isCritical,
      lastChangedBy: user.email,
      lastChangedAt: now,
    });

    return this.mapToDTO(updated);
  }

  async delete(projectId: string, key: string, user: AuthUserPayload): Promise<void> {
    const project = await projectRepository.findById(projectId);
    if (!project) throw new NotFoundError('Project not found');

    const isOwnerOrEditor =
      String(project.ownerId) === String(user.userId) ||
      project.members.some(
        (m) =>
          String(m.userId) === String(user.userId) &&
          (m.role === 'editor' || m.role === 'owner')
      );
    if (!isOwnerOrEditor) {
      throw new ForbiddenError('You do not have permission to delete variables in this project');
    }

    const existing = await this.repo.findByKey(projectId, key);
    if (!existing) throw new NotFoundError(`Variable ${key} not found`);

    await this.repo.deleteByKey(projectId, key);

    const isOwner = String(project.ownerId) === String(user.userId);
    const userMember = project.members.find((m) => String(m.userId) === String(user.userId));
    const userRole = isOwner ? 'Owner' : (userMember?.role === 'editor' ? 'Editor' : 'Member');
    const userName = user.name || (user.email ? user.email.split('@')[0] : 'User');

    const now = new Date();
    await changeRepository.create({
      projectId,
      key,
      action: 'deleted',
      oldValue: existing.value,
      newValue: '',
      oldValueMasked: existing.maskedValue || maskSecret(existing.value),
      newValueMasked: '',
      changedBy: user.email,
      userName,
      userRole,
      changedAt: now,
      source: 'dashboard',
    });

    if (existing.isCritical) {
      await alertService.triggerCriticalAlert({
        project: project.name,
        key,
        action: 'deleted',
        changedBy: user.email,
        changedAt: now.toISOString(),
      }, projectId);
    }
  }

  private getSafePlaceholder(key: string): string {
    const upper = key.toUpperCase();
    if (upper === 'PORT') return '5000';
    if (upper === 'NODE_ENV') return 'development';
    if (upper === 'HOST') return 'localhost';
    return `your-${key.toLowerCase().replace(/_/g, '-')}`;
  }

  async exportEnv(projectId: string, user: AuthUserPayload): Promise<string> {
    const project = await projectRepository.findById(projectId);
    if (!project) throw new NotFoundError('Project not found');

    const isMember =
      String(project.ownerId) === String(user.userId) ||
      project.members.some((m) => String(m.userId) === String(user.userId));
    if (!isMember) throw new ForbiddenError('Access denied to project');

    const variables = await this.repo.listByProject(projectId);
    const sorted = [...variables].sort((a, b) => a.key.localeCompare(b.key));
    if (sorted.length === 0) return '# .env\n';
    return sorted.map((v) => `${v.key}=${v.value}`).join('\n') + '\n';
  }

  async exportExample(projectId: string, user: AuthUserPayload): Promise<string> {
    const project = await projectRepository.findById(projectId);
    if (!project) throw new NotFoundError('Project not found');

    const isMember =
      String(project.ownerId) === String(user.userId) ||
      project.members.some((m) => String(m.userId) === String(user.userId));
    if (!isMember) throw new ForbiddenError('Access denied to project');

    const variables = await this.repo.listByProject(projectId);
    const sorted = [...variables].sort((a, b) => a.key.localeCompare(b.key));
    if (sorted.length === 0) return '# .env.example\n';
    return sorted.map((v) => `${v.key}=${this.getSafePlaceholder(v.key)}`).join('\n') + '\n';
  }

  async getEnvExample(projectId: string, user: AuthUserPayload): Promise<string> {
    return this.exportExample(projectId, user);
  }
}

export const variableService = new VariableService();
