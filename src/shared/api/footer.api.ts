import type {
  FooterColumnDto,
  FooterLinkDto,
  FooterSettingDto,
  MenuItemType,
  PublicFooterDto,
} from '@/shared/types/api';
import { apiClient } from './client';

export interface SaveFooterSettingPayload {
  logoMediaId?: string | null;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  showNewsletter?: boolean;
  newsletterTitle?: string | null;
  newsletterDescription?: string | null;
  newsletterPlaceholder?: string | null;
  newsletterButtonLabel?: string | null;
  newsletterSuccessMessage?: string | null;
  copyrightText?: string | null;
  socialLinks?: FooterSettingDto['socialLinks'];
  paymentIconIds?: string[];
  shippingIconIds?: string[];
}

export interface SaveFooterColumnPayload {
  title?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface SaveFooterLinkPayload {
  label?: string;
  type?: MenuItemType;
  targetId?: string | null;
  url?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  openInNewTab?: boolean;
}

export function getFooterSettings() {
  return apiClient<FooterSettingDto>('/api/admin/footer-settings');
}

export function updateFooterSettings(payload: SaveFooterSettingPayload) {
  return apiClient<FooterSettingDto>('/api/admin/footer-settings', {
    method: 'PUT',
    body: payload,
  });
}

export function listFooterColumnsWithLinks() {
  return apiClient<FooterColumnDto[]>('/api/admin/footer-columns/with-links');
}

export function createFooterColumn(payload: SaveFooterColumnPayload & { title: string }) {
  return apiClient<FooterColumnDto>('/api/admin/footer-columns', {
    method: 'POST',
    body: payload,
  });
}

export function updateFooterColumn(id: string, payload: SaveFooterColumnPayload) {
  return apiClient<FooterColumnDto>(`/api/admin/footer-columns/${id}`, {
    method: 'PUT',
    body: payload,
  });
}

export function deleteFooterColumn(id: string) {
  return apiClient<void>(`/api/admin/footer-columns/${id}`, { method: 'DELETE' });
}

export function createFooterLink(
  columnId: string,
  payload: SaveFooterLinkPayload & { label: string; type: MenuItemType },
) {
  return apiClient<FooterLinkDto>(`/api/admin/footer-columns/${columnId}/links`, {
    method: 'POST',
    body: payload,
  });
}

export function updateFooterLink(id: string, payload: SaveFooterLinkPayload) {
  return apiClient<FooterLinkDto>(`/api/admin/footer-links/${id}`, {
    method: 'PUT',
    body: payload,
  });
}

export function deleteFooterLink(id: string) {
  return apiClient<void>(`/api/admin/footer-links/${id}`, { method: 'DELETE' });
}

export function getPublicFooter() {
  return apiClient<PublicFooterDto>('/api/public/footer', { auth: false });
}

export const FOOTER_LINK_TYPE_LABELS: Record<MenuItemType, string> = {
  PAGE: 'Sayfa',
  CATEGORY: 'Blog kategorisi',
  PRODUCT_CATEGORY: 'Ürün kategorisi',
  PRODUCT: 'Ürün',
  BLOG: 'Blog yazısı',
  CUSTOM_URL: 'Özel URL',
};
