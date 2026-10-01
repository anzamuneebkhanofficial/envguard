export const USER_ROLES = ['owner', 'editor', 'viewer'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const CHANGE_ACTIONS = [
  'created',
  'updated',
  'deleted',
  'synced',
  'member_invited',
  'member_removed',
  'project_created',
  'project_deleted'
] as const;
export type ChangeAction = (typeof CHANGE_ACTIONS)[number];

export const CHANGE_SOURCES = ['cli', 'dashboard'] as const;
export type ChangeSource = (typeof CHANGE_SOURCES)[number];

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

export const SENSITIVE_KEY_PATTERNS = [
  /SECRET/i,
  /PASSWORD/i,
  /PASS/i,
  /TOKEN/i,
  /KEY/i,
  /AUTH/i,
  /CREDENTIAL/i,
  /PRIVATE/i,
  /STRIPE/i,
  /DATABASE.*URL/i,
  /MONGO/i
];
