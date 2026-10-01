import type { Types } from 'mongoose';

export interface AlertPreference {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  projectId: Types.ObjectId;
  notifyOnCriticalChange: boolean;
  webhookUrl?: string;
  emailNotifications: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AlertPreferenceDTO {
  id: string;
  userId: string;
  projectId: string;
  notifyOnCriticalChange: boolean;
  webhookUrl?: string;
  emailNotifications: boolean;
}

export interface CriticalAlertPayload {
  project: string;
  key: string;
  action: 'created' | 'updated' | 'deleted';
  changedBy: string;
  changedAt: string;
}
