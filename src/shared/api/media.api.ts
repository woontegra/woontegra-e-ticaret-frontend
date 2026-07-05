import type {
  ApiErrorResponse,
  ApiResponse,
  MediaAssetDto,
  MediaLibraryFilter,
  MediaListResult,
  MediaTypeFilter,
  MediaUsageType,
} from '@/shared/types/api';
import { API_BASE_URL, ApiError, apiClient } from './client';
import { useAuthStore } from '@/shared/auth/auth.store';

export interface MediaListParams {
  folder?: string;
  search?: string;
  type?: MediaTypeFilter;
  usageType?: MediaUsageType;
  storageProvider?: 'LOCAL' | 'VERCEL_BLOB' | 'R2';
  library?: MediaLibraryFilter;
  page?: number;
  limit?: number;
}

export function listMedia(params: MediaListParams = {}) {
  const query = new URLSearchParams();
  if (params.folder) query.set('folder', params.folder);
  if (params.search) query.set('search', params.search);
  if (params.type) query.set('type', params.type);
  if (params.usageType) query.set('usageType', params.usageType);
  if (params.storageProvider) query.set('storageProvider', params.storageProvider);
  if (params.library) query.set('library', params.library);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

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
  payload: Partial<
    Pick<MediaAssetDto, 'altText' | 'title' | 'folder' | 'usageType'>
  >,
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

async function uploadMediaFile(
  endpoint: string,
  file: File,
  fields: Record<string, string> = {},
) {
  const formData = new FormData();
  formData.append('file', file);
  for (const [key, value] of Object.entries(fields)) {
    if (value) formData.append(key, value);
  }

  const token = useAuthStore.getState().accessToken;
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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

export async function uploadMedia(
  file: File,
  options: { folder?: string; usageType?: MediaUsageType } = {},
) {
  return uploadMediaFile('/api/admin/media/upload', file, {
    folder: options.folder ?? '',
    usageType: options.usageType ?? '',
  });
}

export async function uploadDownloadMedia(
  file: File,
  options: { folder?: string } = {},
) {
  return uploadMediaFile('/api/admin/media/upload-download', file, {
    folder: options.folder ?? 'products',
  });
}

export function isImageMedia(asset: Pick<MediaAssetDto, 'mimeType'>): boolean {
  return asset.mimeType.startsWith('image/');
}

export function isDownloadMedia(
  asset: Pick<MediaAssetDto, 'usageType' | 'mimeType'>,
): boolean {
  return asset.usageType === 'DOWNLOAD_BINARY';
}

export function formatMediaSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
