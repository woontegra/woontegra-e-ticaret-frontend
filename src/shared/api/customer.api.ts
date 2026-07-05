import type {
  CustomerAuthResultDto,
  StoreCustomerDto,
} from '@/shared/types/api';
import { apiClient } from './client';
import { useCustomerAuthStore } from '@/shared/auth/customerAuth.store';

const publicRequest = { auth: false } as const;

function customerHeaders(): HeadersInit | undefined {
  const token = useCustomerAuthStore.getState().accessToken;
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export function registerCustomer(payload: {
  name: string;
  email: string;
  password: string;
  phone?: string | null;
}) {
  return apiClient<CustomerAuthResultDto>('/api/public/customer-auth/register', {
    ...publicRequest,
    method: 'POST',
    body: payload,
  });
}

export function loginCustomer(payload: { email: string; password: string }) {
  return apiClient<CustomerAuthResultDto>('/api/public/customer-auth/login', {
    ...publicRequest,
    method: 'POST',
    body: payload,
  });
}

export function getCustomerMe() {
  return apiClient<StoreCustomerDto>('/api/public/customer-auth/me', {
    auth: false,
    headers: customerHeaders(),
  });
}

export function logoutCustomer() {
  return apiClient<void>('/api/public/customer-auth/logout', {
    auth: false,
    method: 'POST',
    headers: customerHeaders(),
  });
}
