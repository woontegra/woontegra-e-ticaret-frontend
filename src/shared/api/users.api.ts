import { apiClient } from './client';
import type { AuthUser } from './auth.api';

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: string;
  isActive?: boolean;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  isActive?: boolean;
}

export interface ListUsersParams {
  search?: string;
  role?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export function listUsers(params: ListUsersParams = {}) {
  const query = new URLSearchParams();

  if (params.search) query.set('search', params.search);
  if (params.role) query.set('role', params.role);
  if (params.isActive !== undefined) {
    query.set('isActive', String(params.isActive));
  }
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  const qs = query.toString();

  return apiClient<{ items: AuthUser[]; total: number }>(
    `/api/users${qs ? `?${qs}` : ''}`,
  );
}

export function createUser(payload: CreateUserPayload) {
  return apiClient<AuthUser>('/api/users', {
    method: 'POST',
    body: payload,
  });
}

export function updateUser(id: string, payload: UpdateUserPayload) {
  return apiClient<AuthUser>(`/api/users/${id}`, {
    method: 'PATCH',
    body: payload,
  });
}

export function deleteUser(id: string) {
  return apiClient<void>(`/api/users/${id}`, {
    method: 'DELETE',
  });
}
