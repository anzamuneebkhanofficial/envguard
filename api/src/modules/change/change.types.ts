import type { Types } from 'mongoose';
import type { ChangeAction, ChangeSource } from '../../config/constants.js';

export interface Change {
  _id: Types.ObjectId;
  projectId: Types.ObjectId;
  key: string;
  action: ChangeAction;
  oldValue?: string;
  newValue?: string;
  oldValueMasked?: string;
  newValueMasked?: string;
  changedBy: string;
  userName?: string;
  userRole?: string;
  changedAt: Date;
  source: ChangeSource;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChangeDTO {
  id: string;
  projectId: string;
  key: string;
  action: ChangeAction;
  oldValue?: string;
  newValue?: string;
  oldValueMasked?: string;
  newValueMasked?: string;
  changedBy: string;
  userName?: string;
  userRole?: string;
  changedAt: Date;
  source: ChangeSource;
}

export interface ChangeFilterQuery {
  page?: number;
  limit?: number;
  key?: string;
  action?: ChangeAction;
  from?: string;
  to?: string;
}

export interface PaginatedChangesResult {
  changes: ChangeDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
