import type {
  PaymentMethodDto,
  PaymentMethodPublicDto,
} from '@/shared/types/api';
import { apiClient } from './client';

export function listPaymentMethods() {
  return apiClient<PaymentMethodDto[]>('/api/admin/payment-methods');
}

export function updatePaymentMethod(
  id: string,
  input: Partial<{
    name: string;
    isActive: boolean;
    isTestMode: boolean;
    config: PaymentMethodDto['config'];
  }>,
) {
  return apiClient<PaymentMethodDto>(`/api/admin/payment-methods/${id}`, {
    method: 'PUT',
    body: input,
  });
}

export function listPublicPaymentMethods() {
  return apiClient<PaymentMethodPublicDto[]>('/api/public/payment-methods', {
    auth: false,
  });
}

export const PAYMENT_METHOD_TYPE_LABELS = {
  BANK_TRANSFER: 'Havale / EFT',
  CASH_ON_DELIVERY: 'Kapıda ödeme',
  PAYTR: 'PayTR',
  IYZICO: 'Iyzico',
  EXTERNAL_LINK: 'Harici satın alma linki',
} as const;

export const PAYMENT_METHOD_DESCRIPTIONS = {
  BANK_TRANSFER: 'Banka hesapları ve havale talimatları',
  CASH_ON_DELIVERY: 'Teslimatta nakit veya kart ile ödeme',
  PAYTR: 'PayTR sanal POS entegrasyonu',
  IYZICO: 'Iyzico online ödeme entegrasyonu',
  EXTERNAL_LINK: 'Yazılım / harici satın alma yönlendirmesi',
} as const;
