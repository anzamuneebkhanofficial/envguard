'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  apiGetAlertPreference,
  apiUpdateAlertPreference,
  apiTestWebhook,
  type AlertPreferenceItem,
} from '../lib/alerts';

export function useAlerts(projectId?: string) {
  const queryClient = useQueryClient();

  const {
    data: preference,
    isLoading,
    isError,
    refetch,
  } = useQuery<AlertPreferenceItem | null>({
    queryKey: ['alerts', projectId],
    queryFn: () => (projectId ? apiGetAlertPreference(projectId) : Promise.resolve(null)),
    enabled: !!projectId,
  });

  const updateMutation = useMutation({
    mutationFn: (values: {
      notifyOnCriticalChange: boolean;
      webhookUrl?: string;
      emailNotifications: boolean;
    }) => {
      if (!projectId) throw new Error('Missing project ID');
      return apiUpdateAlertPreference(projectId, values);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['alerts', projectId], updated);
    },
  });

  const testWebhookMutation = useMutation({
    mutationFn: (webhookUrl: string) => apiTestWebhook(webhookUrl, projectId),
  });

  return {
    preference,
    isLoading,
    isError,
    refetch,
    updatePreference: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    testWebhook: testWebhookMutation.mutateAsync,
    isTestingWebhook: testWebhookMutation.isPending,
  };
}
