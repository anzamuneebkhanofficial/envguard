import type { Types } from 'mongoose';

export interface Variable {
  _id: Types.ObjectId;
  projectId: Types.ObjectId;
  key: string;
  value: string; // The actual current value
  maskedValue?: string; // Masked value for display
  fingerprint?: string; // SHA-256 hash prefix for detecting value drift
  isCritical: boolean;
  lastChangedBy: string;
  lastChangedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface VariableDTO {
  id: string;
  projectId: string;
  key: string;
  value: string; // The real value for authorized workspace members
  maskedValue?: string; // Masked value for toggling
  isCritical: boolean;
  lastChangedBy: string;
  lastChangedAt: Date;
}

export interface PaginatedVariablesResult {
  variables: VariableDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SyncVariableItem {
  key: string;
  value: string;
}

export interface SyncDiffResult {
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
