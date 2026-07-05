import { apiClient } from './client';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive?: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
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
