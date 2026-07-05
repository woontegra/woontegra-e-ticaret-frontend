import type {
  NotificationDto,
  NotificationListResult,
  NotificationUnreadCountResult,
} from '@/shared/types/api';
import { apiClient } from './client';

export function listNotifications(params: {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
} = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.unreadOnly) query.set('unreadOnly', 'true');
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return apiClient<NotificationListResult>(`/api/admin/notifications${suffix}`);
}

export function getUnreadNotificationCount() {
  return apiClient<NotificationUnreadCountResult>(
    '/api/admin/notifications/unread-count',
  );
}

export function markNotificationRead(id: string) {
  return apiClient<NotificationDto>(`/api/admin/notifications/${id}/read`, {
    method: 'PATCH',
  });
}

export function markAllNotificationsRead() {
  return apiClient<{ updated: number }>(
    '/api/admin/notifications/read-all',
    { method: 'PATCH' },
  );
}

export const NOTIFICATION_TYPE_LABELS: Record<
  NotificationDto['type'],
  string
> = {
  NEW_ORDER: 'Yeni sipariş',
  NEW_CONTACT_MESSAGE: 'İletişim mesajı',
  NEW_REVIEW: 'Yeni yorum',
  LOW_STOCK: 'Stok azaldı',
  PAYMENT_WAITING: 'Ödeme bekliyor',
  SHIPPING_TRACKING_ENTERED: 'Kargo takibi',
};

export function getNotificationLink(notification: NotificationDto): string | null {
  switch (notification.entityType) {
    case 'order':
      return notification.entityId
        ? `/admin/orders/${notification.entityId}`
        : '/admin/orders';
    case 'contact_message':
      return '/admin/contact';
    case 'product_review':
      return '/admin/reviews';
    case 'product':
      return notification.entityId
        ? `/admin/products/${notification.entityId}`
        : '/admin/products';
    default:
      return null;
  }
}
