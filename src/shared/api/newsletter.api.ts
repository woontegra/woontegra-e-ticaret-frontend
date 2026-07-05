import { apiClient } from './client';

export function subscribeNewsletter(payload: { email: string; source?: string }) {
  return apiClient<{ ok: true; alreadySubscribed?: boolean }>(
    '/api/public/newsletter/subscribe',
    {
      method: 'POST',
      body: payload,
      auth: false,
    },
  );
}
