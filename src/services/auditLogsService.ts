import { apiFetch } from '@/lib/apiClient';

export interface AuditLogEntry {
  id: string;
  action: string;
  entity: string | null;
  entityId: string | null;
  actorId: string | null;
  actorEmail: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: unknown;
  createdAt: string;
}

export interface AuditLogsPage {
  data: AuditLogEntry[];
  pagination: { nextCursor: string | null; hasMore: boolean };
}

export interface ListAuditLogsParams {
  action?: string;
  entity?: string;
  actorId?: string;
  search?: string;
  from?: string;
  to?: string;
  limit?: number;
  cursor?: string;
}

export function listAuditLogs(params: ListAuditLogsParams = {}): Promise<AuditLogsPage> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
  });
  const query = qs.toString();
  return apiFetch<AuditLogsPage>(`/admin/audit-logs${query ? `?${query}` : ''}`, { raw: true });
}

export function listAuditActions(): Promise<string[]> {
  return apiFetch<string[]>('/admin/audit-logs/actions');
}
