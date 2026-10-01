import { apiClient } from './api/client';
import type { VariableFormValues } from '../validators/variable';

export interface VariableItem {
  id: string;
  projectId: string;
  key: string;
  value: string; // The real value for authorized workspace members
  maskedValue?: string; // Masked value for toggling
  isCritical: boolean;
  lastChangedBy: string;
  lastChangedAt: string;
}

export interface SyncDiffResponse {
  added: number;
  updated: number;
  deleted: number;
  unchanged: number;
  changes: Array<{
    key: string;
    action: 'created' | 'updated' | 'deleted';
    oldValue?: string;
    newValue?: string;
    oldValueMasked?: string;
    newValueMasked?: string;
    isCritical: boolean;
  }>;
  envExample: string;
}

export interface PaginatedVariables {
  variables: VariableItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface VariableFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export async function apiListVariables(projectId: string): Promise<VariableItem[]> {
  return apiClient<VariableItem[]>(`/projects/${projectId}/variables`);
}

export async function apiListVariablesPaginated(
  projectId: string,
  filters: VariableFilters = {}
): Promise<PaginatedVariables> {
  return apiClient<PaginatedVariables>(`/projects/${projectId}/variables`, {
    params: filters as Record<string, string | number | boolean | undefined>,
  });
}

export async function apiSyncVariables(
  projectId: string,
  variables: Array<{ key: string; value: string }>,
  source: 'cli' | 'dashboard' = 'dashboard'
): Promise<SyncDiffResponse> {
  return apiClient<SyncDiffResponse>(`/projects/${projectId}/variables/sync`, {
    method: 'POST',
    body: JSON.stringify({ variables, source }),
  });
}

export async function apiUpdateVariable(
  projectId: string,
  key: string,
  values: Partial<VariableFormValues>
): Promise<VariableItem> {
  return apiClient<VariableItem>(`/projects/${projectId}/variables/${key}`, {
    method: 'PATCH',
    body: JSON.stringify(values),
  });
}

export async function apiDeleteVariable(projectId: string, key: string): Promise<void> {
  return apiClient<void>(`/projects/${projectId}/variables/${key}`, {
    method: 'DELETE',
  });
}

export async function apiGetEnvExample(projectId: string): Promise<string> {
  const res = await apiClient<{ content: string }>(`/projects/${projectId}/variables/export/example`);
  return res.content;
}

export async function apiExportEnv(projectId: string): Promise<string> {
  const res = await apiClient<{ content: string }>(`/projects/${projectId}/variables/export/env`);
  return res.content;
}

export async function apiExportEnvExample(projectId: string): Promise<string> {
  const res = await apiClient<{ content: string }>(`/projects/${projectId}/variables/export/example`);
  return res.content;
}
