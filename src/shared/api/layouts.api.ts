import type {
  PageBlockDto,
  PageBlockType,
  PageLayoutDto,
  PublicHomeLayoutDto,
  ReorderLayoutBlocksInput,
} from '@/shared/types/api';
import { apiClient } from './client';

export interface SavePageBlockPayload {
  type?: PageBlockType;
  title?: string | null;
  settings?: Record<string, unknown>;
  content?: Record<string, unknown>;
  sortOrder?: number;
  isActive?: boolean;
}

export function getHomeDraftLayout() {
  return apiClient<PageLayoutDto>('/api/admin/layouts/home/draft');
}

export function updateHomeDraftLayout(payload: { name?: string }) {
  return apiClient<PageLayoutDto>('/api/admin/layouts/home/draft', {
    method: 'PUT',
    body: payload,
  });
}

export function createLayoutBlock(
  layoutId: string,
  payload: SavePageBlockPayload & { type: PageBlockType },
) {
  return apiClient<PageBlockDto>(`/api/admin/layouts/${layoutId}/blocks`, {
    method: 'POST',
    body: payload,
  });
}

export function updateLayoutBlock(
  layoutId: string,
  blockId: string,
  payload: SavePageBlockPayload,
) {
  return apiClient<PageBlockDto>(
    `/api/admin/layouts/${layoutId}/blocks/${blockId}`,
    {
      method: 'PUT',
      body: payload,
    },
  );
}

export function deleteLayoutBlock(layoutId: string, blockId: string) {
  return apiClient<void>(`/api/admin/layouts/${layoutId}/blocks/${blockId}`, {
    method: 'DELETE',
  });
}

export function reorderLayoutBlocks(
  layoutId: string,
  payload: ReorderLayoutBlocksInput,
) {
  return apiClient<PageBlockDto[]>(`/api/admin/layouts/${layoutId}/reorder`, {
    method: 'POST',
    body: payload,
  });
}

export function publishLayout(layoutId: string) {
  return apiClient<PageLayoutDto>(`/api/admin/layouts/${layoutId}/publish`, {
    method: 'POST',
  });
}

export function getPublicHomeLayout() {
  return apiClient<PublicHomeLayoutDto | null>('/api/public/layouts/home', {
    auth: false,
  });
}

export const PAGE_BLOCK_TYPE_LABELS: Record<PageBlockType, string> = {
  HERO: 'Hero',
  HERO_SLIDER: 'Hero Slider',
  TEXT: 'Metin',
  TEXT_IMAGE: 'Metin + Görsel',
  IMAGE_BANNER: 'Görsel Banner',
  PRODUCT_GRID: 'Ürün Grid',
  PRODUCT_CAROUSEL: 'Ürün Carousel',
  CATEGORY_GRID: 'Kategori Grid',
  BLOG_GRID: 'Blog Grid',
  TRUST_BADGES: 'Güven Rozetleri',
  FAQ: 'SSS',
  CONTACT_FORM: 'İletişim Formu',
  BRAND_LOGOS: 'Marka Logoları',
  TESTIMONIALS: 'Referanslar',
  NEWSLETTER: 'Bülten',
  CUSTOM_SPACER: 'Boşluk',
  CAMPAIGN: 'Kampanya',
};
