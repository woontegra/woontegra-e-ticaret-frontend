import type {
  OrderDto,
  OrderListResult,
  OrderStatus,
  PaymentStatus,
  ShippingStatus,
} from '@/shared/types/api';
import { apiClient } from './client';

export interface ListOrdersParams {
  orderNumber?: string;
  customer?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  shippingStatus?: ShippingStatus;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export function listOrders(params: ListOrdersParams = {}) {
  const query = new URLSearchParams();
  if (params.orderNumber) query.set('orderNumber', params.orderNumber);
  if (params.customer) query.set('customer', params.customer);
  if (params.status) query.set('status', params.status);
  if (params.paymentStatus) query.set('paymentStatus', params.paymentStatus);
  if (params.shippingStatus) query.set('shippingStatus', params.shippingStatus);
  if (params.dateFrom) query.set('dateFrom', params.dateFrom);
  if (params.dateTo) query.set('dateTo', params.dateTo);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return apiClient<OrderListResult>(`/api/admin/orders${suffix}`);
}

export function getOrder(id: string) {
  return apiClient<OrderDto>(`/api/admin/orders/${id}`);
}

export function updateOrderStatus(id: string, status: OrderStatus) {
  return apiClient<OrderDto>(`/api/admin/orders/${id}/status`, {
    method: 'PATCH',
    body: { status },
  });
}

export function updateOrderPaymentStatus(
  id: string,
  paymentStatus: PaymentStatus,
) {
  return apiClient<OrderDto>(`/api/admin/orders/${id}/payment-status`, {
    method: 'PATCH',
    body: { paymentStatus },
  });
}

export function updateOrderShippingStatus(
  id: string,
  shippingStatus: ShippingStatus | null,
) {
  return apiClient<OrderDto>(`/api/admin/orders/${id}/shipping-status`, {
    method: 'PATCH',
    body: { shippingStatus },
  });
}

export function updateOrderAdminNote(id: string, note: string | null) {
  return apiClient<OrderDto>(`/api/admin/orders/${id}/note`, {
    method: 'PATCH',
    body: { note },
  });
}

export function updateOrderShipment(
  id: string,
  input: {
    carrierId?: string | null;
    trackingNumber?: string | null;
    status?: ShippingStatus;
  },
) {
  return apiClient<OrderDto>(`/api/admin/orders/${id}/shipment`, {
    method: 'PATCH',
    body: input,
  });
}

export function retryOrderDigitalDelivery(id: string) {
  return apiClient<OrderDto>(`/api/admin/orders/${id}/retry-digital-delivery`, {
    method: 'POST',
  });
}

export function retryOrderItemLicense(orderId: string, orderItemId: string) {
  return apiClient<OrderDto>(
    `/api/admin/orders/${orderId}/items/${orderItemId}/retry-license`,
    { method: 'POST' },
  );
}

export function retryOrderItemSaasProvision(orderId: string, orderItemId: string) {
  return apiClient<OrderDto>(
    `/api/admin/orders/${orderId}/items/${orderItemId}/retry-saas-provision`,
    { method: 'POST' },
  );
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Beklemede',
  CONFIRMED: 'Onaylandı',
  PROCESSING: 'İşleniyor',
  COMPLETED: 'Tamamlandı',
  CANCELLED: 'İptal',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Ödeme bekliyor',
  PAID: 'Ödendi',
  FAILED: 'Başarısız',
  REFUNDED: 'İade',
  WAITING_BANK_TRANSFER: 'Havale bekleniyor',
  CASH_ON_DELIVERY: 'Kapıda ödeme',
};

export const SHIPPING_STATUS_LABELS: Record<ShippingStatus, string> = {
  PENDING: 'Kargo bekliyor',
  PREPARING: 'Hazırlanıyor',
  SHIPPED: 'Kargoda',
  DELIVERED: 'Teslim edildi',
  RETURNED: 'İade edildi',
};

export function formatMoney(value: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(value);
}

export function orderStatusBadgeVariant(
  status: OrderStatus,
): 'default' | 'success' | 'warning' | 'danger' {
  switch (status) {
    case 'COMPLETED':
      return 'success';
    case 'CANCELLED':
      return 'danger';
    case 'PENDING':
      return 'warning';
    default:
      return 'default';
  }
}
