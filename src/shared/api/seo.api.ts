import type { RedirectRuleDto, SeoSettingDto, SeoSettingPublicDto } from '@/shared/types/api';
import { apiClient } from './client';

export function getAdminSeoSettings() {
  return apiClient<SeoSettingDto>('/api/admin/seo/seo-settings');
}

export function updateAdminSeoSettings(payload: Partial<SeoSettingDto>) {
  return apiClient<SeoSettingDto>('/api/admin/seo/seo-settings', {
    method: 'PUT',
    body: payload,
  });
}

export function getPublicSeoSettings() {
  return apiClient<SeoSettingPublicDto>('/api/public/seo-settings', {
    auth: false,
  });
}

export function listRedirectRules() {
  return apiClient<RedirectRuleDto[]>('/api/admin/seo/redirect-rules');
}

export function createRedirectRule(input: {
  sourcePath: string;
  targetPath: string;
  statusCode: 301 | 302;
  isActive?: boolean;
}) {
  return apiClient<RedirectRuleDto>('/api/admin/seo/redirect-rules', {
    method: 'POST',
    body: input,
  });
}

export function updateRedirectRule(
  id: string,
  input: Partial<{
    sourcePath: string;
    targetPath: string;
    statusCode: 301 | 302;
    isActive: boolean;
  }>,
) {
  return apiClient<RedirectRuleDto>(`/api/admin/seo/redirect-rules/${id}`, {
    method: 'PUT',
    body: input,
  });
}

export function deleteRedirectRule(id: string) {
  return apiClient<{ ok: true }>(`/api/admin/seo/redirect-rules/${id}`, {
    method: 'DELETE',
  });
}
