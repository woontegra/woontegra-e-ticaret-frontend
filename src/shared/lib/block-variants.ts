export type HeroVariant =
  | 'SIMPLE'
  | 'SPLIT_IMAGE'
  | 'FULL_WIDTH_BANNER'
  | 'CAROUSEL_SLIDER'
  | 'CENTERED'
  | 'DARK_PANEL';

export type ProductDisplayMode =
  | 'GRID'
  | 'CAROUSEL'
  | 'FEATURED_ROW'
  | 'COMPACT_LIST';

export type BlogDisplayMode =
  | 'GRID'
  | 'CAROUSEL'
  | 'FEATURED_POST_PLUS_GRID';

export type ContainerMode = 'CONTAINER' | 'FULL_WIDTH' | 'WIDE';

export type BackgroundType = 'NONE' | 'COLOR' | 'GRADIENT' | 'IMAGE';

export type CarouselTransition = 'FADE' | 'SLIDE';

export type ProductCardStyle = 'SIMPLE' | 'PREMIUM' | 'COMPACT';

export type ProductSource = 'ALL' | 'FEATURED' | 'CATEGORY' | 'MANUAL';

export type TrustBadgeIconType =
  | 'SHIELD'
  | 'KEY'
  | 'DOWNLOAD'
  | 'HEADPHONES'
  | 'ZAP'
  | 'CHECK'
  | 'CUSTOM';

export const HERO_VARIANT_LABELS: Record<HeroVariant, string> = {
  SIMPLE: 'Tek görselli hero',
  SPLIT_IMAGE: 'Sağ görselli hero',
  FULL_WIDTH_BANNER: 'Tam genişlik banner',
  CAROUSEL_SLIDER: 'Carousel slider',
  CENTERED: 'Ortalı hero',
  DARK_PANEL: 'Koyu panel hero',
};

export const PRODUCT_DISPLAY_MODE_LABELS: Record<ProductDisplayMode, string> = {
  GRID: 'Grid',
  CAROUSEL: 'Carousel',
  FEATURED_ROW: 'Öne çıkan satır',
  COMPACT_LIST: 'Kompakt liste',
};

export const BLOG_DISPLAY_MODE_LABELS: Record<BlogDisplayMode, string> = {
  GRID: 'Grid',
  CAROUSEL: 'Carousel',
  FEATURED_POST_PLUS_GRID: 'Öne çıkan + grid',
};

export const TRUST_ICON_OPTIONS: Array<{ value: TrustBadgeIconType; label: string }> = [
  { value: 'SHIELD', label: 'Kalkan' },
  { value: 'KEY', label: 'Anahtar' },
  { value: 'DOWNLOAD', label: 'İndirme' },
  { value: 'HEADPHONES', label: 'Destek' },
  { value: 'ZAP', label: 'Hız' },
  { value: 'CHECK', label: 'Onay' },
  { value: 'CUSTOM', label: 'Özel görsel' },
];

export function normalizeHeroVariant(value: unknown): HeroVariant {
  const variants: HeroVariant[] = [
    'SIMPLE',
    'SPLIT_IMAGE',
    'FULL_WIDTH_BANNER',
    'CAROUSEL_SLIDER',
    'CENTERED',
    'DARK_PANEL',
  ];
  return variants.includes(value as HeroVariant)
    ? (value as HeroVariant)
    : 'SIMPLE';
}

export function normalizeProductDisplayMode(value: unknown): ProductDisplayMode {
  const modes: ProductDisplayMode[] = [
    'GRID',
    'CAROUSEL',
    'FEATURED_ROW',
    'COMPACT_LIST',
  ];
  return modes.includes(value as ProductDisplayMode)
    ? (value as ProductDisplayMode)
    : 'GRID';
}

export function normalizeBlogDisplayMode(value: unknown): BlogDisplayMode {
  const modes: BlogDisplayMode[] = ['GRID', 'CAROUSEL', 'FEATURED_POST_PLUS_GRID'];
  return modes.includes(value as BlogDisplayMode)
    ? (value as BlogDisplayMode)
    : 'GRID';
}
