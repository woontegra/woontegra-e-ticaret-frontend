import type {
  ApiErrorResponse,
  ApiResponse,
  MediaAssetDto,
  MediaListResult,
  MediaTypeFilter,
} from '@/shared/types/api';import { API_BASE_URL, ApiError, apiClient } from './client';
import { useAuthStore } from '@/shared/auth/auth.store';

export interface MediaListParams {
  folder?: string;
  search?: string;
  type?: MediaTypeFilter;
}

export function listMedia(params: MediaListParams = {}) {
  const query = new URLSearchParams();
  if (params.folder) query.set('folder', params.folder);
  if (params.search) query.set('search', params.search);
  if (params.type) query.set('type', params.type);

  const suffix = query.toString() ? `?${query.toString()}` : '';
  return apiClient<MediaListResult>(`/api/admin/media${suffix}`);
}

export function listMediaFolders() {
  return apiClient<string[]>('/api/admin/media/folders');
}

export function getMedia(id: string) {
  return apiClient<MediaAssetDto>(`/api/admin/media/${id}`);
}

export function updateMedia(
  id: string,
  payload: Partial<Pick<MediaAssetDto, 'altText' | 'title' | 'folder' | 'usageType'>>,
) {
  return apiClient<MediaAssetDto>(`/api/admin/media/${id}`, {
    method: 'PUT',
    body: payload,
  });
}

export async function deleteMedia(id: string) {
  const token = useAuthStore.getState().accessToken;
  const response = await fetch(`${API_BASE_URL}/api/admin/media/${id}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok && response.status !== 204) {
    const payload = (await response.json()) as ApiErrorResponse;
    throw new ApiError(
      response.status,
      payload.errors ?? [{ code: 'DELETE_FAILED', message: 'Silme başarısız' }],
    );
  }
}

export async function uploadMedia(
  file: File,
  options: { folder?: string; usageType?: string } = {},
) {
  const formData = new FormData();
  formData.append('file', file);
  if (options.folder) formData.append('folder', options.folder);
  if (options.usageType) formData.append('usageType', options.usageType);

  const token = useAuthStore.getState().accessToken;
  const response = await fetch(`${API_BASE_URL}/api/admin/media/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  const payload = await response.json();

  if (!response.ok) {
    const errorPayload = payload as ApiErrorResponse;
    throw new ApiError(
      response.status,
      errorPayload.errors ?? [{ code: 'UPLOAD_FAILED', message: 'Yükleme başarısız' }],
    );
  }

  return (payload as ApiResponse<MediaAssetDto>).data;
}

export function isImageMedia(asset: Pick<MediaAssetDto, 'mimeType'>): boolean {
  return asset.mimeType.startsWith('image/');
}

export function formatMediaSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
