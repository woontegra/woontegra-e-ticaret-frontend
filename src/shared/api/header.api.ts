import type { HeaderSettingDto } from '@/shared/types/api';
import { apiClient } from './client';

export function getHeaderSettings() {
  return apiClient<HeaderSettingDto>('/api/admin/header-settings');
}

export function updateHeaderSettings(payload: Partial<HeaderSettingDto>) {
  return apiClient<HeaderSettingDto>('/api/admin/header-settings', {
    method: 'PUT',
    body: payload,
  });
}

export function getPublicHeaderSettings() {
  return apiClient<HeaderSettingDto>('/api/public/header-settings', {
    auth: false,
  });
}

export const HEADER_LOGO_POSITION_LABELS = {
  LEFT: 'Sol',
  CENTER: 'Orta',
} as const;

export const HEADER_MENU_POSITION_LABELS = {
  LEFT: 'Sol',
  CENTER: 'Orta',
  RIGHT: 'Sağ',
} as const;
