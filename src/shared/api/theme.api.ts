import type { ThemeSettingDto } from '@/shared/types/api';
import { apiClient } from './client';

export function getThemeSettings() {
  return apiClient<ThemeSettingDto>('/api/admin/theme-settings');
}

export function updateThemeSettings(payload: Partial<ThemeSettingDto>) {
  return apiClient<ThemeSettingDto>('/api/admin/theme-settings', {
    method: 'PUT',
    body: payload,
  });
}

export function getPublicThemeSettings() {
  return apiClient<ThemeSettingDto>('/api/public/theme-settings', { auth: false });
}
