import { apiClient } from './api/client';

export interface ChangeItem {
  id: string;
  projectId: string;
  key: string;
  action: 'created' | 'updated' | 'deleted' | 'synced' | 'member_invited' | 'member_removed' | 'project_created' | 'project_deleted';
  oldValue?: string;
  newValue?: string;
  oldValueMasked?: string;
  newValueMasked?: string;
  changedBy: string;
  userName?: string;
  userRole?: string;
  changedAt: string;
  source: 'cli' | 'dashboard';
}

export interface PaginatedChanges {
  changes: ChangeItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface ChangeFilters {
  page?: number;
  limit?: number;
  key?: string;
  action?: 'created' | 'updated' | 'deleted';
  from?: string;
  to?: string;
}

export async function apiListChanges(
  projectId: string,
  filters: ChangeFilters = {}
): Promise<PaginatedChanges> {
  return apiClient<PaginatedChanges>(`/projects/${projectId}/changes`, {
    params: filters as Record<string, string | number | boolean | undefined>,
  });
}

export async function apiGetChange(projectId: string, changeId: string): Promise<ChangeItem> {
  return apiClient<ChangeItem>(`/projects/${projectId}/changes/${changeId}`);
}
