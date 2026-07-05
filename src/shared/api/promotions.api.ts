import type {
  CampaignDto,
  CampaignPublicDto,
  CouponDto,
  CouponType,
  PublicCatalogListResult,
} from '@/shared/types/api';
import { apiClient } from './client';

export interface CouponListParams {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export function listCoupons(params: CouponListParams = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.isActive !== undefined) {
    query.set('isActive', String(params.isActive));
  }
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  const suffix = query.toString() ? `?${query.toString()}` : '';
  return apiClient<PublicCatalogListResult<CouponDto>>(`/api/admin/coupons${suffix}`);
}

export function createCoupon(input: {
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount?: number | null;
  usageLimit?: number | null;
  usageLimitPerCustomer?: number | null;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive?: boolean;
  applicableProductIds?: string[];
  applicableCategoryIds?: string[];
}) {
  return apiClient<CouponDto>('/api/admin/coupons', {
    method: 'POST',
    body: input,
  });
}

export function updateCoupon(
  id: string,
  input: Partial<{
    code: string;
    type: CouponType;
    value: number;
    minOrderAmount: number | null;
    usageLimit: number | null;
    usageLimitPerCustomer: number | null;
    startsAt: string | null;
    endsAt: string | null;
    isActive: boolean;
    applicableProductIds: string[];
    applicableCategoryIds: string[];
  }>,
) {
  return apiClient<CouponDto>(`/api/admin/coupons/${id}`, {
    method: 'PUT',
    body: input,
  });
}

export function deleteCoupon(id: string) {
  return apiClient<{ ok: true }>(`/api/admin/coupons/${id}`, {
    method: 'DELETE',
  });
}

export interface CampaignListParams {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export function listCampaigns(params: CampaignListParams = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.isActive !== undefined) {
    query.set('isActive', String(params.isActive));
  }
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  const suffix = query.toString() ? `?${query.toString()}` : '';
  return apiClient<PublicCatalogListResult<CampaignDto>>(
    `/api/admin/campaigns${suffix}`,
  );
}

export function createCampaign(input: {
  name: string;
  type: CampaignDto['type'];
  bannerImageId?: string | null;
  title: string;
  description?: string | null;
  buttonText?: string | null;
  buttonUrl?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive?: boolean;
}) {
  return apiClient<CampaignDto>('/api/admin/campaigns', {
    method: 'POST',
    body: input,
  });
}

export function updateCampaign(
  id: string,
  input: Partial<{
    name: string;
    type: CampaignDto['type'];
    bannerImageId: string | null;
    title: string;
    description: string | null;
    buttonText: string | null;
    buttonUrl: string | null;
    startsAt: string | null;
    endsAt: string | null;
    isActive: boolean;
  }>,
) {
  return apiClient<CampaignDto>(`/api/admin/campaigns/${id}`, {
    method: 'PUT',
    body: input,
  });
}

export function deleteCampaign(id: string) {
  return apiClient<{ ok: true }>(`/api/admin/campaigns/${id}`, {
    method: 'DELETE',
  });
}

export async function findCampaignById(id: string) {
  const result = await listCampaigns({ limit: 500 });
  return result.items.find((item) => item.id === id) ?? null;
}

export async function findCouponById(id: string) {
  const result = await listCoupons({ limit: 500 });
  return result.items.find((item) => item.id === id) ?? null;
}

export function listPublicCampaigns() {
  return apiClient<CampaignPublicDto[]>('/api/public/campaigns', {
    auth: false,
  });
}

export function getPublicCampaign(id: string) {
  return apiClient<CampaignPublicDto>(`/api/public/campaigns/${id}`, {
    auth: false,
  });
}

export const COUPON_TYPE_LABELS: Record<CouponType, string> = {
  PERCENTAGE: 'Yüzde indirim',
  FIXED_AMOUNT: 'Sabit tutar',
  FREE_SHIPPING: 'Ücretsiz kargo',
};

export const CAMPAIGN_TYPE_LABELS: Record<CampaignDto['type'], string> = {
  BANNER: 'Banner',
  HERO: 'Hero',
  PRODUCT_PROMO: 'Ürün promosyonu',
  CATEGORY_PROMO: 'Kategori promosyonu',
};
