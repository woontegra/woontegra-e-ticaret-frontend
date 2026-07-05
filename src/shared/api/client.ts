import type {
  ApiErrorResponse,
  ApiResponse,
} from '@/shared/types/api';
import { useAuthStore } from '@/shared/auth/auth.store';

export class ApiError extends Error {
  constructor(
    public status: number,
    public errors: ApiErrorResponse['errors'],
  ) {
    const first = errors[0];
    const fieldHint = first?.field ? ` (${first.field})` : '';
    super(first?.message ? `${first.message}${fieldHint}` : 'Request failed');
    this.name = 'ApiError';
  }
}

function getBaseUrl(): string {
  const url = import.meta.env.VITE_API_URL;

  if (!url) {
    console.warn('[api] VITE_API_URL is not defined');
    return '';
  }

  return url.replace(/\/$/, '');
}

export const API_BASE_URL = getBaseUrl();

interface RequestOptions extends Omit<RequestInit, 'body' | 'credentials'> {
  body?: unknown;
  auth?: boolean;
  withCredentials?: boolean;
}

export async function apiClient<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, auth = true, withCredentials = false, headers: customHeaders, ...rest } = options;

  const headers = new Headers(customHeaders);

  if (body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (auth) {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers,
    credentials: withCredentials ? 'include' : 'same-origin',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await response.json();

  if (!response.ok) {
    const errorPayload = payload as ApiErrorResponse;
    const apiError = new ApiError(
      response.status,
      errorPayload.errors ?? [
        { code: 'REQUEST_FAILED', message: 'Request failed' },
      ],
    );

    if (auth && typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (response.status === 401 && path.startsWith('/admin')) {
        useAuthStore.getState().logout();
        if (!path.startsWith('/admin/login')) {
          window.location.assign('/admin/login');
        }
      } else if (
        response.status === 403 &&
        path.startsWith('/admin') &&
        !path.startsWith('/admin/unauthorized')
      ) {
        window.location.assign('/admin/unauthorized');
      }
    }

    throw apiError;
  }

  return (payload as ApiResponse<T>).data;
}
