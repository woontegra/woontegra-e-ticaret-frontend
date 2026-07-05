import type { DeliveryMode, ProductKind } from '@/shared/types/api';
import { emptyDownloadFilesConfig } from '@/shared/lib/productDownloadFiles';

export type ProductPresetId =
  | 'DOWNLOADABLE'
  | 'LICENSED'
  | 'SAAS'
  | 'FREE_TOOL'
  | 'SERVICE';

export interface ProductPreset {
  id: ProductPresetId;
  label: string;
  description: string;
}

export const PRODUCT_PRESETS: ProductPreset[] = [
  {
    id: 'DOWNLOADABLE',
    label: 'İndirilebilir Masaüstü Program',
    description: 'Ödeme sonrası dosya indirme; lisans sunucusu gerekmez.',
  },
  {
    id: 'LICENSED',
    label: 'Merkezi Lisanslı Program',
    description: 'İndirilebilir program + merkezi lisans bildirimi (ileriki faz).',
  },
  {
    id: 'SAAS',
    label: 'SaaS / Abonelik',
    description: 'Web tabanlı abonelik; müşteri girişi gerekebilir.',
  },
  {
    id: 'FREE_TOOL',
    label: 'Ücretsiz Araç',
    description: 'Ücretsiz indirme; sepete ekleme kapalı.',
  },
  {
    id: 'SERVICE',
    label: 'Hizmet / Teklif',
    description: 'Teklif al akışı; sepete eklenmez.',
  },
];

export interface ProductPresetFormSlice {
  productKind: ProductKind;
  deliveryMode: DeliveryMode;
  purchaseEnabled: boolean;
  licenseRequired: boolean;
  licenseAppCode: string | null;
  licenseDays: number | null;
  licenseMaxDevices: number | null;
  licenseMonths: number | null;
  saasAppCode: string | null;
  saasRequiresLogin: boolean;
  basePrice: number | null;
  salePrice: number | null;
  downloadFiles: ReturnType<typeof emptyDownloadFilesConfig>;
}

export function inferPresetFromProduct(input: {
  deliveryMode: DeliveryMode;
  productKind: ProductKind;
  purchaseEnabled: boolean;
  licenseRequired: boolean;
}): ProductPresetId {
  if (input.deliveryMode === 'QUOTE_ONLY' || input.productKind === 'SERVICE') {
    return 'SERVICE';
  }
  if (input.deliveryMode === 'SAAS') return 'SAAS';
  if (input.deliveryMode === 'FREE_DOWNLOAD') return 'FREE_TOOL';
  if (input.deliveryMode === 'LICENSED_DOWNLOAD' || input.licenseRequired) {
    return 'LICENSED';
  }
  if (input.deliveryMode === 'PAID_DOWNLOAD') return 'DOWNLOADABLE';
  return 'DOWNLOADABLE';
}

export function applyProductPreset(
  presetId: ProductPresetId,
  current: ProductPresetFormSlice,
): ProductPresetFormSlice {
  const base = { ...current, downloadFiles: { ...current.downloadFiles } };

  switch (presetId) {
    case 'DOWNLOADABLE':
      return {
        ...base,
        productKind: 'SOFTWARE',
        deliveryMode: 'PAID_DOWNLOAD',
        purchaseEnabled: true,
        licenseRequired: false,
        licenseAppCode: null,
        licenseDays: null,
        licenseMaxDevices: null,
        downloadFiles: {
          ...base.downloadFiles,
          publicFreeDownload: false,
          showAfterPaymentOnly: true,
        },
      };
    case 'LICENSED':
      return {
        ...base,
        productKind: 'SOFTWARE',
        deliveryMode: 'LICENSED_DOWNLOAD',
        purchaseEnabled: true,
        licenseRequired: true,
        licenseAppCode: base.licenseAppCode ?? 'MUVEKKIL_KASA_DESKTOP',
        licenseDays: base.licenseDays ?? 365,
        licenseMaxDevices: base.licenseMaxDevices ?? 1,
        downloadFiles: {
          ...base.downloadFiles,
          publicFreeDownload: false,
          showAfterPaymentOnly: true,
        },
      };
    case 'SAAS':
      return {
        ...base,
        productKind: 'SOFTWARE',
        deliveryMode: 'SAAS',
        purchaseEnabled: true,
        licenseRequired: false,
        saasAppCode: base.saasAppCode ?? 'MUVEKKIL_KASA_SAAS',
        saasRequiresLogin: true,
        licenseMonths: base.licenseMonths ?? 12,
      };
    case 'FREE_TOOL':
      return {
        ...base,
        productKind: 'SOFTWARE',
        deliveryMode: 'FREE_DOWNLOAD',
        purchaseEnabled: false,
        licenseRequired: false,
        licenseAppCode: null,
        basePrice: 0,
        salePrice: 0,
        downloadFiles: {
          ...base.downloadFiles,
          publicFreeDownload: true,
          showAfterPaymentOnly: false,
        },
      };
    case 'SERVICE':
      return {
        ...base,
        productKind: 'SERVICE',
        deliveryMode: 'QUOTE_ONLY',
        purchaseEnabled: false,
        licenseRequired: false,
        licenseAppCode: null,
      };
    default:
      return base;
  }
}

export function emptyPresetFormSlice(): ProductPresetFormSlice {
  return {
    productKind: 'SOFTWARE',
    deliveryMode: 'PAID_DOWNLOAD',
    purchaseEnabled: true,
    licenseRequired: false,
    licenseAppCode: null,
    licenseDays: null,
    licenseMaxDevices: null,
    licenseMonths: null,
    saasAppCode: null,
    saasRequiresLogin: false,
    basePrice: null,
    salePrice: null,
    downloadFiles: emptyDownloadFilesConfig(),
  };
}
