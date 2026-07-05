import type {
  PageDto,
  PageListResult,
  PageStatus,
  PageType,
} from '@/shared/types/api';
import { apiClient } from './client';

export interface PageListParams {
  search?: string;
  status?: PageStatus;
  pageType?: PageType;
}

export interface SavePagePayload {
  title?: string;
  slug?: string;
  status?: PageStatus;
  pageType?: PageType;
  excerpt?: string | null;
  contentHtml?: string;
  blocksJson?: unknown | null;
  featuredImageId?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImageId?: string | null;
  canonicalUrl?: string | null;
  robotsIndex?: boolean;
}

export function listPages(params: PageListParams = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.status) query.set('status', params.status);
  if (params.pageType) query.set('pageType', params.pageType);

  const suffix = query.toString() ? `?${query.toString()}` : '';
  return apiClient<PageListResult>(`/api/admin/pages${suffix}`);
}

export function getPage(id: string) {
  return apiClient<PageDto>(`/api/admin/pages/${id}`);
}

export function getPublicPage(slug: string) {
  return apiClient<PageDto>(`/api/public/pages/${slug}`, { auth: false });
}

export function createPage(payload: SavePagePayload) {
  return apiClient<PageDto>('/api/admin/pages', {
    method: 'POST',
    body: payload,
  });
}

export function updatePage(id: string, payload: SavePagePayload) {
  return apiClient<PageDto>(`/api/admin/pages/${id}`, {
    method: 'PUT',
    body: payload,
  });
}

export function deletePage(id: string) {
  return apiClient<void>(`/api/admin/pages/${id}`, { method: 'DELETE' });
}

export function publishPage(id: string) {
  return apiClient<PageDto>(`/api/admin/pages/${id}/publish`, {
    method: 'POST',
  });
}

export function unpublishPage(id: string) {
  return apiClient<PageDto>(`/api/admin/pages/${id}/unpublish`, {
    method: 'POST',
  });
}

export const PAGE_STATUS_LABELS: Record<PageStatus, string> = {
  DRAFT: 'Taslak',
  PUBLISHED: 'Yayında',
};

export const PAGE_TYPE_LABELS: Record<PageType, string> = {
  STANDARD: 'Standart',
  LEGAL: 'Yasal',
  LANDING: 'Landing',
};

export function slugifyClient(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}
