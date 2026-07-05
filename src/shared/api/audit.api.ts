import { apiClient } from './client';
import type { AuditLogDto, AuditLogListResult } from '@/shared/types/api';

export interface ListAuditLogsParams {
  userId?: string;
  module?: string;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export function listAuditLogs(params: ListAuditLogsParams = {}) {
  const query = new URLSearchParams();
  if (params.userId) query.set('userId', params.userId);
  if (params.module) query.set('module', params.module);
  if (params.action) query.set('action', params.action);
  if (params.dateFrom) query.set('dateFrom', params.dateFrom);
  if (params.dateTo) query.set('dateTo', params.dateTo);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return apiClient<AuditLogListResult>(`/api/admin/audit-logs${suffix}`);
}

export function getAuditModules() {
  return apiClient<string[]>('/api/admin/audit-logs/modules');
}

export function getAuditActions() {
  return apiClient<string[]>('/api/admin/audit-logs/actions');
}

export type { AuditLogDto };
