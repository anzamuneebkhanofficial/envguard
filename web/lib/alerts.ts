import { apiClient } from './api/client';

export interface AlertPreferenceItem {
  id: string;
  userId: string;
  projectId: string;
  notifyOnCriticalChange: boolean;
  webhookUrl: string;
  emailNotifications: boolean;
}

export async function apiGetAlertPreference(projectId: string): Promise<AlertPreferenceItem> {
  return apiClient<AlertPreferenceItem>(`/alerts/${projectId}`);
}

export async function apiUpdateAlertPreference(
  projectId: string,
  values: {
    notifyOnCriticalChange: boolean;
    webhookUrl?: string;
    emailNotifications: boolean;
  }
): Promise<AlertPreferenceItem> {
  return apiClient<AlertPreferenceItem>(`/alerts/${projectId}`, {
    method: 'PUT',
    body: JSON.stringify(values),
  });
}

export async function apiTestWebhook(webhookUrl: string, projectId?: string): Promise<{ message: string; status: number }> {
  return apiClient<{ message: string; status: number }>('/alerts/test-webhook', {
    method: 'POST',
    body: JSON.stringify({ webhookUrl, projectId }),
  });
}
