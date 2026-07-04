import { apiClient } from './client';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: string;
  firstName?: string | null;
  lastName?: string | null;
  tenantId?: string | null;
  isActive?: boolean;
  tenant?: {
    id: string;
    slug: string;
    name: string;
  } | null;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export function login(payload: LoginPayload) {
  return apiClient<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: payload,
    auth: false,
  });
}

export function getMe() {
  return apiClient<AuthUser>('/api/auth/me');
}

export function logout() {
  return apiClient<{ success: boolean }>('/api/auth/logout', {
    method: 'POST',
  });
}
