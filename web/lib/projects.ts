import { apiClient } from './api/client';
import type { ProjectFormValues, AddMemberFormValues } from '../validators/project';

export interface ProjectMember {
  userId: string;
  name?: string;
  email?: string;
  role: 'owner' | 'editor' | 'viewer';
  invitedBy?: string;
  invitedAt?: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  ownerName?: string;
  ownerEmail?: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
  deletedBy?: string | null;
  deletionNote?: string | null;
  members: ProjectMember[];
  variableCount: number;
  lastChangedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedProjects {
  projects: ProjectItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ProjectFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export async function apiListProjects(): Promise<ProjectItem[]> {
  return apiClient<ProjectItem[]>('/projects');
}

export async function apiListProjectsPaginated(
  filters: ProjectFilters = {}
): Promise<PaginatedProjects> {
  return apiClient<PaginatedProjects>('/projects', {
    params: filters as Record<string, string | number | boolean | undefined>,
  });
}

export async function apiGetProject(id: string): Promise<ProjectItem> {
  return apiClient<ProjectItem>(`/projects/${id}`);
}

export async function apiCreateProject(values: ProjectFormValues): Promise<ProjectItem> {
  return apiClient<ProjectItem>('/projects', {
    method: 'POST',
    body: JSON.stringify(values),
  });
}

export async function apiUpdateProject(id: string, values: Partial<ProjectFormValues>): Promise<ProjectItem> {
  return apiClient<ProjectItem>(`/projects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(values),
  });
}

export async function apiDeleteProject(id: string, note?: string): Promise<void> {
  return apiClient<void>(`/projects/${id}`, {
    method: 'DELETE',
    body: note ? JSON.stringify({ note }) : undefined,
  });
}

export async function apiAddMember(projectId: string, values: AddMemberFormValues): Promise<ProjectItem> {
  return apiClient<ProjectItem>(`/projects/${projectId}/members`, {
    method: 'POST',
    body: JSON.stringify(values),
  });
}

export async function apiRemoveMember(projectId: string, userId: string): Promise<ProjectItem> {
  return apiClient<ProjectItem>(`/projects/${projectId}/members/${userId}`, {
    method: 'DELETE',
  });
}
