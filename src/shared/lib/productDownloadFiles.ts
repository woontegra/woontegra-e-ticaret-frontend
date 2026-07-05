import type { MediaAssetDto, ProductDownloadFile, ProductDownloadFilesConfig } from '@/shared/types/api';
import { formatMediaSize } from '@/shared/api/media.api';

export function emptyDownloadFilesConfig(): ProductDownloadFilesConfig {
  return {
    version: '',
    publicFreeDownload: false,
    showAfterPaymentOnly: true,
    files: [
      {
        label: 'Setup',
        url: '',
        type: 'setup',
        version: '',
        size: '',
        sha256: '',
        buttonLabel: 'Kurulum Dosyasını İndir',
      },
      {
        label: 'Portable',
        url: '',
        type: 'portable',
        version: '',
        size: '',
        sha256: '',
        buttonLabel: 'Portable Sürümü İndir',
      },
    ],
  };
}

export function normalizeDownloadFiles(
  raw: ProductDownloadFilesConfig | null | undefined,
): ProductDownloadFilesConfig {
  if (!raw) return emptyDownloadFilesConfig();
  return {
    version: raw.version ?? '',
    publicFreeDownload: raw.publicFreeDownload ?? false,
    showAfterPaymentOnly: raw.showAfterPaymentOnly ?? true,
    files:
      raw.files?.length && raw.files.length > 0
        ? raw.files
        : emptyDownloadFilesConfig().files,
  };
}

export function hasDownloadFiles(
  config: ProductDownloadFilesConfig | null | undefined,
): boolean {
  if (!config?.files?.length) return false;
  return config.files.some(
    (file) =>
      Boolean(file.mediaAssetId?.trim()) ||
      Boolean(file.storageKey?.trim()) ||
      Boolean(file.url?.trim()),
  );
}

/** @deprecated use hasDownloadFiles */
export function hasDownloadFileUrls(
  config: ProductDownloadFilesConfig | null | undefined,
): boolean {
  return hasDownloadFiles(config);
}

export function productDownloadFileFromAsset(
  asset: MediaAssetDto,
  patch: Partial<ProductDownloadFile> = {},
): ProductDownloadFile {
  return {
    label: patch.label ?? asset.title ?? asset.originalName,
    type: patch.type,
    mediaAssetId: asset.id,
    storageProvider: asset.storageProvider,
    storageKey: asset.storageKey,
    fileName: asset.fileName,
    originalName: asset.originalName,
    mimeType: asset.mimeType,
    size: formatMediaSize(asset.size),
    url: '',
    version: patch.version ?? '',
    sha256: patch.sha256 ?? '',
    buttonLabel: patch.buttonLabel,
  };
}

export function fileHasAsset(file: ProductDownloadFile): boolean {
  return Boolean(file.mediaAssetId?.trim() || file.storageKey?.trim());
}
