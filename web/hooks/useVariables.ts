'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  apiListVariables,
  apiSyncVariables,
  apiUpdateVariable,
  apiDeleteVariable,
  apiGetEnvExample,
  apiExportEnv,
  apiExportEnvExample,
  type VariableItem,
} from '../lib/variables';
import type { VariableFormValues } from '../validators/variable';

export function useVariables(projectId?: string) {
  const queryClient = useQueryClient();

  const {
    data: variables = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<VariableItem[]>({
    queryKey: ['variables', projectId],
    queryFn: () => (projectId ? apiListVariables(projectId) : Promise.resolve([])),
    enabled: !!projectId,
    staleTime: 2000,
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
  });

  const syncMutation = useMutation({
    mutationFn: (vars: Array<{ key: string; value: string }>) => {
      if (!projectId) throw new Error('Missing project ID');
      return apiSyncVariables(projectId, vars, 'dashboard');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variables', projectId] });
      queryClient.invalidateQueries({ queryKey: ['variables-paginated', projectId] });
      queryClient.invalidateQueries({ queryKey: ['changes', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['envExample', projectId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ key, values }: { key: string; values: Partial<VariableFormValues> }) => {
      if (!projectId) throw new Error('Missing project ID');
      return apiUpdateVariable(projectId, key, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variables', projectId] });
      queryClient.invalidateQueries({ queryKey: ['variables-paginated', projectId] });
      queryClient.invalidateQueries({ queryKey: ['changes', projectId] });
      queryClient.invalidateQueries({ queryKey: ['envExample', projectId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (key: string) => {
      if (!projectId) throw new Error('Missing project ID');
      return apiDeleteVariable(projectId, key);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variables', projectId] });
      queryClient.invalidateQueries({ queryKey: ['variables-paginated', projectId] });
      queryClient.invalidateQueries({ queryKey: ['changes', projectId] });
      queryClient.invalidateQueries({ queryKey: ['envExample', projectId] });
    },
  });

  const { data: envExample = '', refetch: refetchExample } = useQuery<string>({
    queryKey: ['envExample', projectId],
    queryFn: () => (projectId ? apiGetEnvExample(projectId) : Promise.resolve('')),
    enabled: !!projectId,
    staleTime: 60 * 1000,
  });

  const exportEnv = async (): Promise<string> => {
    if (!projectId) throw new Error('Missing project ID');
    return apiExportEnv(projectId);
  };

  const exportEnvExample = async (): Promise<string> => {
    if (!projectId) throw new Error('Missing project ID');
    return apiExportEnvExample(projectId);
  };

  return {
    variables,
    isLoading,
    isError,
    refetch,
    envExample,
    refetchExample,
    exportEnv,
    exportEnvExample,
    syncVariables: syncMutation.mutateAsync,
    isSyncing: syncMutation.isPending,
    updateVariable: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteVariable: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
