import type { DeliveryMode, ProductStatus } from '@/shared/types/api';

export type ProductPrimaryActionType =
  | 'download'
  | 'add_to_cart'
  | 'subscribe'
  | 'quote'
  | 'none';

export interface ProductPrimaryAction {
  type: ProductPrimaryActionType;
  label: string;
}

export interface ProductActionSource {
  status: ProductStatus;
  deliveryMode: DeliveryMode;
  purchaseEnabled: boolean;
  basePrice: number | null;
  salePrice: number | null;
}

function isFreeProduct(product: ProductActionSource): boolean {
  const price = product.salePrice ?? product.basePrice;
  return price === null || price <= 0;
}

export function getProductPrimaryAction(
  product: ProductActionSource,
): ProductPrimaryAction {
  if (product.status !== 'ACTIVE') {
    return { type: 'none', label: '' };
  }

  switch (product.deliveryMode) {
    case 'FREE_DOWNLOAD':
      return { type: 'download', label: 'İndir' };
    case 'PAID_DOWNLOAD':
    case 'LICENSED_DOWNLOAD':
      return { type: 'add_to_cart', label: 'Sepete Ekle' };
    case 'SAAS':
      return { type: 'subscribe', label: 'Abone Ol' };
    case 'QUOTE_ONLY':
      return { type: 'quote', label: 'Teklif Al' };
    case 'NONE':
    default:
      break;
  }

  if (!product.purchaseEnabled && isFreeProduct(product)) {
    return { type: 'download', label: 'İndir' };
  }

  if (!product.purchaseEnabled || isFreeProduct(product)) {
    return { type: 'quote', label: 'Teklif Al' };
  }

  return { type: 'add_to_cart', label: 'Sepete Ekle' };
}

export function isProductPubliclyVisible(product: ProductActionSource): boolean {
  return product.status === 'ACTIVE';
}
