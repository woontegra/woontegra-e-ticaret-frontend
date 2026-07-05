import type { DeliveryMode, PublicProductDto } from '@/shared/types/api';
import {
  getProductPrimaryAction,
  type ProductActionSource,
} from '@/shared/lib/getProductPrimaryAction';

export function buildQuoteContactUrl(productName: string): string {
  const konu = encodeURIComponent(`Teklif: ${productName}`);
  const mesaj = encodeURIComponent(
    `${productName} için teklif almak istiyorum.`,
  );
  return `/iletisim?konu=${konu}&mesaj=${mesaj}`;
}

export function buildDownloadContactUrl(productName: string): string {
  const konu = encodeURIComponent(`İndirme: ${productName}`);
  const mesaj = encodeURIComponent(
    `${productName} indirme bağlantısı hakkında bilgi almak istiyorum.`,
  );
  return `/iletisim?konu=${konu}&mesaj=${mesaj}`;
}

export function getDeliveryModeBadge(deliveryMode: DeliveryMode): string | null {
  switch (deliveryMode) {
    case 'FREE_DOWNLOAD':
      return 'Ücretsiz';
    case 'PAID_DOWNLOAD':
      return 'İndirilebilir';
    case 'LICENSED_DOWNLOAD':
      return 'Lisanslı';
    case 'SAAS':
      return 'SaaS';
    case 'QUOTE_ONLY':
      return 'Teklif';
    default:
      return null;
  }
}

export function formatPublicProductPrice(
  product: Pick<
    PublicProductDto,
    | 'price'
    | 'basePrice'
    | 'salePrice'
    | 'compareAtPrice'
    | 'currency'
    | 'deliveryMode'
    | 'purchaseEnabled'
  >,
): string | null {
  if (product.deliveryMode === 'FREE_DOWNLOAD') {
    return 'Ücretsiz';
  }

  if (product.deliveryMode === 'QUOTE_ONLY' || !product.purchaseEnabled) {
    return 'Teklif';
  }

  const amount = product.price ?? product.salePrice ?? product.basePrice;
  if (amount === null) return null;

  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: product.currency || 'TRY',
  }).format(amount);
}

export function toProductActionSource(
  product: PublicProductDto,
): ProductActionSource {
  return {
    status: 'ACTIVE',
    deliveryMode: product.deliveryMode,
    purchaseEnabled: product.purchaseEnabled,
    basePrice: product.basePrice,
    salePrice: product.salePrice,
  };
}

export function canAddProductToCart(product: PublicProductDto): boolean {
  const action = getProductPrimaryAction(toProductActionSource(product));
  return action.type === 'add_to_cart' || action.type === 'subscribe';
}

export function getProductDeliveryHint(product: PublicProductDto): string | null {
  switch (product.deliveryMode) {
    case 'FREE_DOWNLOAD':
      return 'Ücretsiz indirilebilir araç';
    case 'PAID_DOWNLOAD':
      return 'Ödeme sonrası indirme bağlantısı gönderilir';
    case 'LICENSED_DOWNLOAD':
      return 'Ödeme sonrası lisans ve kurulum bilgileri gönderilir';
    case 'SAAS':
      return product.saasRequiresLogin
        ? 'Web tabanlı abonelik · Satın alma için üyelik/giriş gerekebilir'
        : 'Web tabanlı abonelik';
    case 'QUOTE_ONLY':
      return 'Fiyat için teklif alın';
    default:
      return null;
  }
}

export { getProductPrimaryAction };
