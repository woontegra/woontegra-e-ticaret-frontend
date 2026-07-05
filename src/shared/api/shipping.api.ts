import type {
  ShippingCarrierDto,
  ShippingMethodDto,
  ShippingMethodType,
} from '@/shared/types/api';
import { apiClient } from './client';

export function listShippingCarriers() {
  return apiClient<ShippingCarrierDto[]>('/api/admin/shipping-carriers');
}

export function listActiveShippingCarriers() {
  return apiClient<ShippingCarrierDto[]>('/api/admin/shipping-carriers/active');
}

export function createShippingCarrier(input: {
  name: string;
  trackingUrlTemplate: string;
  logoId?: string | null;
  isActive?: boolean;
}) {
  return apiClient<ShippingCarrierDto>('/api/admin/shipping-carriers', {
    method: 'POST',
    body: input,
  });
}

export function updateShippingCarrier(
  id: string,
  input: Partial<{
    name: string;
    trackingUrlTemplate: string;
    logoId: string | null;
    isActive: boolean;
  }>,
) {
  return apiClient<ShippingCarrierDto>(`/api/admin/shipping-carriers/${id}`, {
    method: 'PUT',
    body: input,
  });
}

export function deleteShippingCarrier(id: string) {
  return apiClient<{ ok: true }>(`/api/admin/shipping-carriers/${id}`, {
    method: 'DELETE',
  });
}

export function listShippingMethods() {
  return apiClient<ShippingMethodDto[]>('/api/admin/shipping-methods');
}

export function createShippingMethod(input: {
  name: string;
  type: ShippingMethodType;
  price: number;
  freeShippingThreshold?: number | null;
  isActive?: boolean;
}) {
  return apiClient<ShippingMethodDto>('/api/admin/shipping-methods', {
    method: 'POST',
    body: input,
  });
}

export function updateShippingMethod(
  id: string,
  input: Partial<{
    name: string;
    type: ShippingMethodType;
    price: number;
    freeShippingThreshold: number | null;
    isActive: boolean;
  }>,
) {
  return apiClient<ShippingMethodDto>(`/api/admin/shipping-methods/${id}`, {
    method: 'PUT',
    body: input,
  });
}

export function deleteShippingMethod(id: string) {
  return apiClient<{ ok: true }>(`/api/admin/shipping-methods/${id}`, {
    method: 'DELETE',
  });
}

export const SHIPPING_METHOD_TYPE_LABELS: Record<ShippingMethodType, string> = {
  FIXED: 'Sabit ücret',
  FREE_OVER_AMOUNT: 'Belirli tutar üzeri ücretsiz',
};

export function formatMoney(value: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(value);
}
