import type {
  MailLogDto,
  MailSettingDto,
  MailTemplateDto,
  SendTestMailResult,
} from '@/shared/types/api';
import { apiClient } from './client';

export function getMailSettings() {
  return apiClient<MailSettingDto>('/api/admin/mail-settings');
}

export function updateMailSettings(payload: Partial<MailSettingDto>) {
  return apiClient<MailSettingDto>('/api/admin/mail-settings', {
    method: 'PUT',
    body: payload,
  });
}

export function listMailTemplates() {
  return apiClient<MailTemplateDto[]>('/api/admin/mail-templates');
}

export function getMailTemplate(id: string) {
  return apiClient<MailTemplateDto>(`/api/admin/mail-templates/${id}`);
}

export function updateMailTemplate(
  id: string,
  payload: Partial<{
    name: string;
    subject: string;
    htmlContent: string;
    textContent: string | null;
    variables: MailTemplateDto['variables'];
    isActive: boolean;
  }>,
) {
  return apiClient<MailTemplateDto>(`/api/admin/mail-templates/${id}`, {
    method: 'PUT',
    body: payload,
  });
}

export function sendTestMail(payload: {
  toEmail: string;
  templateKey?: string;
}) {
  return apiClient<SendTestMailResult>('/api/admin/mail/test', {
    method: 'POST',
    body: payload,
  });
}

export function listMailLogs(limit = 50) {
  return apiClient<MailLogDto[]>(`/api/admin/mail/logs?limit=${limit}`);
}

export const MAIL_LOG_STATUS_LABELS = {
  PENDING: 'Bekliyor',
  SENT: 'Gönderildi',
  FAILED: 'Başarısız',
  SKIPPED: 'Atlandı',
} as const;

export const MAIL_TEMPLATE_KEY_LABELS: Record<string, string> = {
  ORDER_CREATED: 'Sipariş oluşturuldu',
  PAYMENT_RECEIVED: 'Ödeme alındı',
  BANK_TRANSFER_WAITING: 'Havale bekleniyor',
  ORDER_SHIPPED: 'Kargoya verildi',
  ORDER_DELIVERED: 'Teslim edildi',
  PASSWORD_RESET: 'Şifre sıfırlama',
  CONTACT_REPLY: 'İletişim yanıtı',
  REVIEW_APPROVED: 'Yorum onaylandı',
};
