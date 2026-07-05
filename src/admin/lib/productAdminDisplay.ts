import type { ProductDto } from '@/shared/types/api';
import { hasDownloadFiles } from '@/shared/lib/productDownloadFiles';

export function formatProductPrice(product: ProductDto): string {
  const price = product.salePrice ?? product.basePrice;
  if (product.deliveryMode === 'FREE_DOWNLOAD') return 'Ücretsiz';
  if (price === null || price === undefined) return '—';
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: product.currency || 'TRY',
    maximumFractionDigits: 0,
  }).format(price);
}

export function getProductSaleStatusLabel(product: ProductDto): string {
  if (product.status !== 'ACTIVE') return 'Yayında değil';
  if (product.deliveryMode === 'FREE_DOWNLOAD') return 'Ücretsiz';
  if (product.deliveryMode === 'QUOTE_ONLY') return 'Fiyatsız / teklif';
  if (!product.purchaseEnabled) return 'Satış kapalı';
  const price = product.salePrice ?? product.basePrice;
  if (price === null) return 'Fiyatsız / teklif';
  return 'Satışta';
}

export function getProductDeliveryStatusLabel(product: ProductDto): string {
  switch (product.deliveryMode) {
    case 'FREE_DOWNLOAD':
    case 'PAID_DOWNLOAD':
    case 'LICENSED_DOWNLOAD':
      if (hasDownloadFiles(product.downloadFiles)) return 'Dijital var';
      return 'R2 indirme hazır değil';
    case 'SAAS':
      return 'SaaS / abonelik';
    case 'QUOTE_ONLY':
      return 'Teklif';
    default:
      if (product.productKind === 'PHYSICAL') return 'Fiziksel';
      return '—';
  }
}

export function getProductLicenseStatusLabel(product: ProductDto): string {
  if (product.licenseRequired && product.licenseAppCode) {
    return product.licenseAppCode;
  }
  if (product.deliveryMode === 'LICENSED_DOWNLOAD') return 'Merkezi (eksik kod)';
  return 'Yok';
}

export type ProductBadgeVariant =
  | 'downloadable'
  | 'licensed'
  | 'saas'
  | 'free'
  | 'service'
  | 'featured'
  | 'active'
  | 'passive';

export function getProductBadges(product: ProductDto): ProductBadgeVariant[] {
  const badges: ProductBadgeVariant[] = [];

  switch (product.deliveryMode) {
    case 'FREE_DOWNLOAD':
      badges.push('free');
      break;
    case 'LICENSED_DOWNLOAD':
      badges.push('licensed');
      break;
    case 'SAAS':
      badges.push('saas');
      break;
    case 'QUOTE_ONLY':
      badges.push('service');
      break;
    case 'PAID_DOWNLOAD':
      badges.push('downloadable');
      break;
    default:
      break;
  }

  if (product.isFeatured) badges.push('featured');
  badges.push(product.status === 'ACTIVE' ? 'active' : 'passive');

  return badges;
}

export const PRODUCT_BADGE_LABELS: Record<ProductBadgeVariant, string> = {
  downloadable: 'İndirilebilir',
  licensed: 'Lisanslı',
  saas: 'SaaS',
  free: 'Ücretsiz',
  service: 'Hizmet',
  featured: 'Öne çıkan',
  active: 'Aktif',
  passive: 'Pasif',
};
