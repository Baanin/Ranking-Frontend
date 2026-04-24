export const PERMISSIONS = {
  MANAGE_TOURNAMENTS: 'MANAGE_TOURNAMENTS',
  MANAGE_PLAYERS: 'MANAGE_PLAYERS',
  MANAGE_RESULTS: 'MANAGE_RESULTS',
  MANAGE_USERS: 'MANAGE_USERS',
  VIEW_ADMIN_PANEL: 'VIEW_ADMIN_PANEL',
  VIEW_AUDIT_LOGS: 'VIEW_AUDIT_LOGS',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: Permission[] = Object.values(PERMISSIONS);

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: Permission[];
  lastLoginAt?: string | null;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}
