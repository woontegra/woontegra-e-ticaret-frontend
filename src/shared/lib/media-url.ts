import { API_BASE_URL } from '@/shared/api/client';

/** Ensures media URLs work on the public storefront (absolute API URLs). */
export function resolvePublicMediaUrl(
  url: string | null | undefined,
): string | undefined {
  if (!url?.trim()) return undefined;

  const trimmed = url.trim();

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  if (trimmed.startsWith('/') && API_BASE_URL) {
    return `${API_BASE_URL}${trimmed}`;
  }

  return trimmed;
}
