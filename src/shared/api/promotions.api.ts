import type {
  CampaignDto,
  CampaignPublicDto,
  CouponDto,
  CouponType,
} from '@/shared/types/api';
import { apiClient } from './client';

export function listCoupons() {
  return apiClient<CouponDto[]>('/api/admin/coupons');
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

export function listCampaigns() {
  return apiClient<CampaignDto[]>('/api/admin/campaigns');
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
