import { apiFetch } from '@/lib/apiClient';
import type { Permission } from '@/types/auth';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: Permission[];
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminInput {
  email: string;
  name: string;
  password: string;
  role: string;
  permissions: Permission[];
}

export interface UpdateAdminInput {
  name?: string;
  role?: string;
  permissions?: Permission[];
  isActive?: boolean;
  password?: string;
}

export function listAdmins(): Promise<AdminUser[]> {
  return apiFetch<AdminUser[]>('/admin/users');
}

export function getAdmin(id: string): Promise<AdminUser> {
  return apiFetch<AdminUser>(`/admin/users/${id}`);
}

export function createAdmin(input: CreateAdminInput): Promise<AdminUser> {
  return apiFetch<AdminUser>('/admin/users', { method: 'POST', body: input });
}

export function updateAdmin(id: string, input: UpdateAdminInput): Promise<AdminUser> {
  return apiFetch<AdminUser>(`/admin/users/${id}`, { method: 'PATCH', body: input });
}

export function deleteAdmin(id: string): Promise<void> {
  return apiFetch<void>(`/admin/users/${id}`, { method: 'DELETE' });
}
