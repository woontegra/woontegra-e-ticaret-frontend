import type { CompanySettingDto, SiteSettingDto } from '@/shared/types/api';
import { apiClient } from './client';

export function getAdminSiteSettings() {
  return apiClient<SiteSettingDto>('/api/admin/site-settings');
}

export function updateAdminSiteSettings(payload: Partial<SiteSettingDto>) {
  return apiClient<SiteSettingDto>('/api/admin/site-settings', {
    method: 'PUT',
    body: payload,
  });
}

export function getPublicSiteSettings() {
  return apiClient<SiteSettingDto>('/api/public/site-settings', {
    auth: false,
  });
}

export function getAdminCompanySettings() {
  return apiClient<CompanySettingDto>('/api/admin/company-settings');
}

export function updateAdminCompanySettings(payload: Partial<CompanySettingDto>) {
  return apiClient<CompanySettingDto>('/api/admin/company-settings', {
    method: 'PUT',
    body: payload,
  });
}

export function getPublicCompanySettings() {
  return apiClient<CompanySettingDto>('/api/public/company-settings', {
    auth: false,
  });
}
