import type {
  SaasMembershipListResult,
  SaasMembershipStatus,
} from '@/shared/types/api';
import { apiClient } from './client';

export interface ListSaasMembershipsParams {
  status?: SaasMembershipStatus;
  saasAppCode?: string;
  customer?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export function listSaasMemberships(params: ListSaasMembershipsParams = {}) {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.saasAppCode) query.set('saasAppCode', params.saasAppCode);
  if (params.customer) query.set('customer', params.customer);
  if (params.dateFrom) query.set('dateFrom', params.dateFrom);
  if (params.dateTo) query.set('dateTo', params.dateTo);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return apiClient<SaasMembershipListResult>(`/api/admin/saas-memberships${suffix}`);
}

export const SAAS_MEMBERSHIP_STATUS_LABELS: Record<SaasMembershipStatus, string> = {
  PENDING: 'Bekliyor',
  ACTIVE: 'Aktif',
  FAILED: 'Başarısız',
  EXPIRED: 'Süresi doldu',
  CANCELLED: 'İptal',
};

export const SAAS_PROVISION_STATUS_LABELS = {
  PENDING: 'Bekliyor',
  CREATED: 'Oluşturuldu',
  FAILED: 'Başarısız',
  SKIPPED: 'Atlandı',
} as const;
