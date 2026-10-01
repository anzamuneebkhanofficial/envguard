import type { Types } from 'mongoose';
import type { UserRole } from '../../config/constants.js';

export interface ProjectMember {
  userId: Types.ObjectId;
  name?: string;
  email?: string;
  role: UserRole;
  invitedBy?: string;
  invitedAt?: Date;
}

export interface Project {
  _id: Types.ObjectId;
  name: string;
  description: string;
  ownerId: Types.ObjectId;
  ownerName?: string;
  ownerEmail?: string;
  isDeleted?: boolean;
  deletedAt?: Date | null;
  deletedBy?: string | null;
  deletionNote?: string | null;
  members: ProjectMember[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectDTO {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  ownerName?: string;
  ownerEmail?: string;
  isDeleted?: boolean;
  deletedAt?: Date | null;
  deletedBy?: string | null;
  deletionNote?: string | null;
  members: {
    userId: string;
    name?: string;
    email?: string;
    role: UserRole;
    invitedBy?: string;
    invitedAt?: Date;
  }[];
  variableCount?: number;
  lastChangedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedProjectsResult {
  projects: ProjectDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
