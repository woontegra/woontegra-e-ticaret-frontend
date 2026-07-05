import type {
  CartDto,
  CheckoutInput,
  CheckoutResultDto,
  OrderDto,
  OrderListResult,
  PublicOrderDto,
} from '@/shared/types/api';
import { apiClient } from './client';

const cartRequest = { auth: false, withCredentials: true } as const;

export function getCart() {
  return apiClient<CartDto>('/api/public/cart', cartRequest);
}

export function addCartItem(payload: {
  productId: string;
  variantId?: string | null;
  quantity?: number;
}) {
  return apiClient<CartDto>('/api/public/cart/items', {
    ...cartRequest,
    method: 'POST',
    body: payload,
  });
}

export function updateCartItem(id: string, quantity: number) {
  return apiClient<CartDto>(`/api/public/cart/items/${id}`, {
    ...cartRequest,
    method: 'PATCH',
    body: { quantity },
  });
}

export function removeCartItem(id: string) {
  return apiClient<CartDto>(`/api/public/cart/items/${id}`, {
    ...cartRequest,
    method: 'DELETE',
  });
}

export function applyCartCoupon(code: string) {
  return apiClient<CartDto>('/api/public/cart/coupon', {
    ...cartRequest,
    method: 'POST',
    body: { code },
  });
}

export function removeCartCoupon() {
  return apiClient<CartDto>('/api/public/cart/coupon', {
    ...cartRequest,
    method: 'DELETE',
  });
}

export function checkout(payload: CheckoutInput) {
  return apiClient<CheckoutResultDto>('/api/public/checkout', {
    ...cartRequest,
    method: 'POST',
    body: payload,
  });
}

export function getPublicOrder(orderNumber: string) {
  return apiClient<PublicOrderDto>(`/api/public/orders/${orderNumber}`, {
    auth: false,
  });
}

export function listOrders(params: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
} = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set('customer', params.search);
  if (params.status) query.set('status', params.status);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return apiClient<OrderListResult>(`/api/admin/orders${suffix}`);
}

/** @deprecated Use orders.api.ts */
export function getOrder(id: string) {
  return apiClient<OrderDto>(`/api/admin/orders/${id}`);
}

export const ORDER_STATUS_LABELS = {
  PENDING: 'Beklemede',
  CONFIRMED: 'Onaylandı',
  PROCESSING: 'İşleniyor',
  COMPLETED: 'Tamamlandı',
  CANCELLED: 'İptal',
} as const;

export const PAYMENT_STATUS_LABELS = {
  PENDING: 'Ödeme bekliyor',
  PAID: 'Ödendi',
  FAILED: 'Başarısız',
  REFUNDED: 'İade',
  WAITING_BANK_TRANSFER: 'Havale bekleniyor',
  CASH_ON_DELIVERY: 'Kapıda ödeme',
} as const;

export const SHIPPING_STATUS_LABELS = {
  PENDING: 'Kargo bekliyor',
  PREPARING: 'Hazırlanıyor',
  SHIPPED: 'Kargoda',
  DELIVERED: 'Teslim edildi',
  RETURNED: 'İade edildi',
} as const;

export function formatMoney(value: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(value);
}
