'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  apiListProjects,
  apiGetProject,
  apiCreateProject,
  apiUpdateProject,
  apiDeleteProject,
  apiAddMember,
  apiRemoveMember,
  type ProjectItem,
} from '../lib/projects';
import type { ProjectFormValues, AddMemberFormValues } from '../validators/project';

export function useProjects() {
  const queryClient = useQueryClient();

  const {
    data: projects = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<ProjectItem[]>({
    queryKey: ['projects'],
    queryFn: apiListProjects,
    staleTime: 2000,
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
  });

  const createMutation = useMutation({
    mutationFn: (values: ProjectFormValues) => apiCreateProject(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects-paginated'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDeleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects-paginated'] });
    },
  });

  return {
    projects,
    isLoading,
    isError,
    refetch,
    createProject: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    deleteProject: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}

export function useProject(projectId?: string) {
  const queryClient = useQueryClient();

  const {
    data: project,
    isLoading,
    isError,
    refetch,
  } = useQuery<ProjectItem | null>({
    queryKey: ['projects', projectId],
    queryFn: () => (projectId ? apiGetProject(projectId) : Promise.resolve(null)),
    enabled: !!projectId,
    staleTime: 2000,
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
  });

  const updateMutation = useMutation({
    mutationFn: (values: Partial<ProjectFormValues>) => {
      if (!projectId) throw new Error('Missing project ID');
      return apiUpdateProject(projectId, values);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['projects', projectId], updated);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: (values: AddMemberFormValues) => {
      if (!projectId) throw new Error('Missing project ID');
      return apiAddMember(projectId, values);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['projects', projectId], updated);
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (targetUserId: string) => {
      if (!projectId) throw new Error('Missing project ID');
      return apiRemoveMember(projectId, targetUserId);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['projects', projectId], updated);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (note?: string) => {
      if (!projectId) throw new Error('Missing project ID');
      return apiDeleteProject(projectId, note);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  return {
    project,
    isLoading,
    isError,
    refetch,
    updateProject: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    addMember: addMemberMutation.mutateAsync,
    isAddingMember: addMemberMutation.isPending,
    removeMember: removeMemberMutation.mutateAsync,
    isRemovingMember: removeMemberMutation.isPending,
    deleteProject: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
