import type {
  ProductReviewDto,
  ProductReviewListResult,
  ProductReviewPublicDto,
  ProductReviewsPublicResult,
  ProductReviewStatus,
  SubmitProductReviewInput,
} from '@/shared/types/api';
import { apiClient } from './client';

export function listProductReviews(params: {
  status?: ProductReviewStatus;
  productId?: string;
  search?: string;
  page?: number;
  limit?: number;
} = {}) {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.productId) query.set('productId', params.productId);
  if (params.search) query.set('search', params.search);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return apiClient<ProductReviewListResult>(
    `/api/admin/product-reviews${suffix}`,
  );
}

export function getProductReview(id: string) {
  return apiClient<ProductReviewDto>(`/api/admin/product-reviews/${id}`);
}

export function approveProductReview(id: string) {
  return apiClient<ProductReviewDto>(
    `/api/admin/product-reviews/${id}/approve`,
    { method: 'PATCH' },
  );
}

export function rejectProductReview(id: string) {
  return apiClient<ProductReviewDto>(
    `/api/admin/product-reviews/${id}/reject`,
    { method: 'PATCH' },
  );
}

export function replyProductReview(id: string, adminReply: string) {
  return apiClient<ProductReviewDto>(
    `/api/admin/product-reviews/${id}/reply`,
    { method: 'PATCH', body: { adminReply } },
  );
}

export function deleteProductReview(id: string) {
  return apiClient<{ ok: true }>(`/api/admin/product-reviews/${id}`, {
    method: 'DELETE',
  });
}

export function listPublicProductReviews(
  productSlug: string,
  params: { page?: number; limit?: number } = {},
) {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return apiClient<ProductReviewsPublicResult>(
    `/api/public/products/${productSlug}/reviews${suffix}`,
    { auth: false },
  );
}

export function submitProductReview(
  productSlug: string,
  payload: SubmitProductReviewInput,
) {
  return apiClient<ProductReviewPublicDto>(
    `/api/public/products/${productSlug}/reviews`,
    { method: 'POST', body: payload, auth: false },
  );
}

export const PRODUCT_REVIEW_STATUS_LABELS: Record<
  ProductReviewStatus,
  string
> = {
  PENDING: 'Onay bekliyor',
  APPROVED: 'Yayında',
  REJECTED: 'Reddedildi',
};
