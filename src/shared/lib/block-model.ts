import type { PageBlockDto, PageBlockType, PublicPageBlockDto } from '@/shared/types/api';
import {
  normalizeBlogDisplayMode,
  normalizeHeroVariant,
  normalizeProductDisplayMode,
  type BackgroundType,
  type BlogDisplayMode,
  type CarouselTransition,
  type ContainerMode,
  type HeroVariant,
  type ProductCardStyle,
  type ProductDisplayMode,
  type ProductSource,
  type TrustBadgeIconType,
} from './block-variants';

export type BlockAlignment = 'left' | 'center' | 'right';

export interface BlockSliderSettings {
  autoplay?: boolean;
  autoplayDelay?: number;
  showDots?: boolean;
  showArrows?: boolean;
  transitionEffect?: CarouselTransition;
  loop?: boolean;
}

export interface ParsedBlockSettings {
  variant?: HeroVariant;
  displayMode?: ProductDisplayMode | BlogDisplayMode;
  layout?: string;
  containerMode?: ContainerMode;
  backgroundType?: BackgroundType;
  backgroundColor?: string;
  backgroundGradient?: string;
  backgroundImageId?: string | null;
  backgroundImageUrl?: string;
  textColor?: string;
  alignment: BlockAlignment;
  fullWidth: boolean;
  desktopVisible?: boolean;
  mobileVisible?: boolean;
  paddingTop?: string;
  paddingBottom?: string;
  desktopHeight?: string;
  mobileHeight?: string;
  borderRadius?: string;
  customClass?: string;
  showOnMobile: boolean;
  itemCount?: number;
  columns?: number;
  columnsTablet?: number;
  columnsMobile?: number;
  height?: string;
  productKind?: string;
  source?: ProductSource;
  categorySlug?: string;
  manualProductIds?: string[];
  blogCategorySlug?: string;
  showPrice?: boolean;
  showBadge?: boolean;
  showDescription?: boolean;
  showCta?: boolean;
  showExcerpt?: boolean;
  showDate?: boolean;
  showCategory?: boolean;
  showCover?: boolean;
  cardStyle?: ProductCardStyle;
  slider?: BlockSliderSettings;
}

export interface ParsedBlockContent {
  headline?: string;
  subheadline?: string;
  description?: string;
  body?: string;
  imageMediaId?: string | null;
  imageUrl?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  secondaryCtaLabel?: string;
  secondaryCtaUrl?: string;
  linkUrl?: string;
  slides?: BlockSlideItem[];
  badges?: BlockBadgeItem[];
  faqItems?: BlockFaqItem[];
  testimonials?: BlockTestimonialItem[];
  brandLogos?: BlockBrandLogoItem[];
  formKey?: string;
  campaignId?: string;
  emailPlaceholder?: string;
  buttonLabel?: string;
  successMessage?: string;
}

export interface BlockSlideItem {
  headline?: string;
  subheadline?: string;
  description?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  secondaryCtaLabel?: string;
  secondaryCtaUrl?: string;
  imageUrl?: string;
  imageMediaId?: string | null;
  mobileImageUrl?: string;
  mobileImageMediaId?: string | null;
  backgroundImageUrl?: string;
  backgroundImageMediaId?: string | null;
  backgroundColor?: string;
  textColor?: string;
  alignment?: BlockAlignment;
  sortOrder?: number;
  isActive?: boolean;
}

export interface BlockBadgeItem {
  label: string;
  title?: string;
  description?: string;
  iconUrl?: string;
  iconType?: TrustBadgeIconType;
  sortOrder?: number;
  isActive?: boolean;
}

export interface BlockFaqItem {
  question: string;
  answer: string;
}

export interface BlockTestimonialItem {
  name: string;
  quote: string;
  role?: string;
  avatarUrl?: string;
}

export interface BlockBrandLogoItem {
  name?: string;
  imageUrl: string;
  linkUrl?: string;
}

function getString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function getNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function getBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') return value;
  return fallback;
}

function getStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items = value.filter((item): item is string => typeof item === 'string');
  return items.length > 0 ? items : undefined;
}

function parseAlignment(value: unknown): BlockAlignment {
  const alignment = getString(value);
  return alignment === 'center' || alignment === 'right' ? alignment : 'left';
}

function parseSliderSettings(value: unknown): BlockSliderSettings | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const raw = value as Record<string, unknown>;
  const effect = getString(raw.transitionEffect);
  return {
    autoplay: typeof raw.autoplay === 'boolean' ? raw.autoplay : undefined,
    autoplayDelay: getNumber(raw.autoplayDelay),
    showDots: typeof raw.showDots === 'boolean' ? raw.showDots : undefined,
    showArrows: typeof raw.showArrows === 'boolean' ? raw.showArrows : undefined,
    transitionEffect:
      effect === 'FADE' || effect === 'SLIDE' ? effect : undefined,
    loop: typeof raw.loop === 'boolean' ? raw.loop : undefined,
  };
}

export function parseBlockSettings(
  raw: Record<string, unknown>,
): ParsedBlockSettings {
  const containerMode = getString(raw.containerMode) as ContainerMode | undefined;
  const fullWidth =
    raw.fullWidth === true ||
    containerMode === 'FULL_WIDTH' ||
    getBoolean(raw.fullWidth, false);

  return {
    variant: raw.variant ? normalizeHeroVariant(raw.variant) : undefined,
    displayMode: raw.displayMode
      ? normalizeProductDisplayMode(raw.displayMode) ||
        normalizeBlogDisplayMode(raw.displayMode)
      : undefined,
    layout: getString(raw.layout),
    containerMode:
      containerMode === 'CONTAINER' ||
      containerMode === 'FULL_WIDTH' ||
      containerMode === 'WIDE'
        ? containerMode
        : fullWidth
          ? 'FULL_WIDTH'
          : 'CONTAINER',
    backgroundType: getString(raw.backgroundType) as BackgroundType | undefined,
    backgroundColor: getString(raw.backgroundColor),
    backgroundGradient: getString(raw.backgroundGradient),
    backgroundImageId:
      typeof raw.backgroundImageId === 'string'
        ? raw.backgroundImageId
        : raw.backgroundImageId === null
          ? null
          : undefined,
    backgroundImageUrl: getString(raw.backgroundImageUrl),
    textColor: getString(raw.textColor),
    alignment: parseAlignment(raw.alignment),
    fullWidth,
    desktopVisible: getBoolean(raw.desktopVisible, true),
    mobileVisible: getBoolean(raw.mobileVisible ?? raw.showOnMobile, true),
    paddingTop: getString(raw.paddingTop),
    paddingBottom: getString(raw.paddingBottom),
    desktopHeight: getString(raw.desktopHeight),
    mobileHeight: getString(raw.mobileHeight),
    borderRadius: getString(raw.borderRadius),
    customClass: getString(raw.customClass),
    showOnMobile: getBoolean(raw.mobileVisible ?? raw.showOnMobile, true),
    itemCount: getNumber(raw.itemCount),
    columns: getNumber(raw.columns),
    columnsTablet: getNumber(raw.columnsTablet),
    columnsMobile: getNumber(raw.columnsMobile),
    height: getString(raw.height),
    productKind: getString(raw.productKind),
    source: getString(raw.source) as ProductSource | undefined,
    categorySlug: getString(raw.categorySlug),
    manualProductIds: getStringArray(raw.manualProductIds),
    blogCategorySlug: getString(raw.blogCategorySlug),
    showPrice: typeof raw.showPrice === 'boolean' ? raw.showPrice : undefined,
    showBadge: typeof raw.showBadge === 'boolean' ? raw.showBadge : undefined,
    showDescription:
      typeof raw.showDescription === 'boolean' ? raw.showDescription : undefined,
    showCta: typeof raw.showCta === 'boolean' ? raw.showCta : undefined,
    showExcerpt: typeof raw.showExcerpt === 'boolean' ? raw.showExcerpt : undefined,
    showDate: typeof raw.showDate === 'boolean' ? raw.showDate : undefined,
    showCategory:
      typeof raw.showCategory === 'boolean' ? raw.showCategory : undefined,
    showCover: typeof raw.showCover === 'boolean' ? raw.showCover : undefined,
    cardStyle: getString(raw.cardStyle) as ProductCardStyle | undefined,
    slider: parseSliderSettings(raw.slider),
  };
}

function parseSlideItem(value: unknown): BlockSlideItem | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  const headline =
    getString(item.headline) ?? getString(item.slideTitle);
  const subheadline =
    getString(item.subheadline) ?? getString(item.slideSubtitle);
  const ctaLabel =
    getString(item.ctaLabel) ?? getString(item.primaryButtonText);
  const ctaUrl = getString(item.ctaUrl) ?? getString(item.primaryButtonUrl);
  const imageUrl = getString(item.imageUrl);
  const imageMediaId =
    getString(item.imageMediaId) ?? getString(item.desktopImageId);

  if (
    !headline &&
    !subheadline &&
    !imageUrl &&
    !imageMediaId &&
    !getString(item.description)
  ) {
    return null;
  }

  return {
    headline,
    subheadline,
    description: getString(item.description) ?? getString(item.slideDescription),
    ctaLabel,
    ctaUrl,
    secondaryCtaLabel:
      getString(item.secondaryCtaLabel) ?? getString(item.secondaryButtonText),
    secondaryCtaUrl:
      getString(item.secondaryCtaUrl) ?? getString(item.secondaryButtonUrl),
    imageUrl,
    imageMediaId:
      typeof item.imageMediaId === 'string'
        ? item.imageMediaId
        : item.imageMediaId === null
          ? null
          : getString(item.desktopImageId) ?? undefined,
    mobileImageUrl: getString(item.mobileImageUrl),
    mobileImageMediaId:
      typeof item.mobileImageMediaId === 'string'
        ? item.mobileImageMediaId
        : item.mobileImageMediaId === null
          ? null
          : getString(item.mobileImageId) ?? undefined,
    backgroundImageUrl: getString(item.backgroundImageUrl),
    backgroundImageMediaId:
      typeof item.backgroundImageMediaId === 'string'
        ? item.backgroundImageMediaId
        : item.backgroundImageMediaId === null
          ? null
          : getString(item.backgroundImageId) ?? undefined,
    backgroundColor: getString(item.backgroundColor),
    textColor: getString(item.textColor),
    alignment: parseAlignment(item.alignment),
    sortOrder: getNumber(item.sortOrder),
    isActive: item.isActive !== false,
  };
}

function parseBadgeItem(value: unknown): BlockBadgeItem | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  const label = getString(item.label) ?? getString(item.title);
  if (!label) return null;
  if (item.isActive === false) return null;

  const iconType = getString(item.iconType);
  return {
    label,
    title: getString(item.title),
    description: getString(item.description),
    iconUrl: getString(item.iconUrl),
    iconType:
      iconType === 'SHIELD' ||
      iconType === 'KEY' ||
      iconType === 'DOWNLOAD' ||
      iconType === 'HEADPHONES' ||
      iconType === 'ZAP' ||
      iconType === 'CHECK' ||
      iconType === 'CUSTOM'
        ? iconType
        : undefined,
    sortOrder: getNumber(item.sortOrder),
    isActive: item.isActive !== false,
  };
}

function parseFaqItem(value: unknown): BlockFaqItem | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  const question = getString(item.question);
  const answer = getString(item.answer);
  if (!question || !answer) return null;
  return { question, answer };
}

function parseTestimonialItem(value: unknown): BlockTestimonialItem | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  const name = getString(item.name);
  const quote = getString(item.quote);
  if (!name || !quote) return null;
  return {
    name,
    quote,
    role: getString(item.role),
    avatarUrl: getString(item.avatarUrl),
  };
}

function parseBrandLogoItem(value: unknown): BlockBrandLogoItem | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  const imageUrl = getString(item.imageUrl);
  if (!imageUrl) return null;
  return {
    imageUrl,
    name: getString(item.name),
    linkUrl: getString(item.linkUrl),
  };
}

function parseObjectArray<T>(
  value: unknown,
  parser: (item: unknown) => T | null,
): T[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items = value.map(parser).filter((item): item is T => item !== null);
  return items.length > 0 ? items : undefined;
}

export function parseBlockContent(
  raw: Record<string, unknown>,
): ParsedBlockContent {
  return {
    headline: getString(raw.headline),
    subheadline: getString(raw.subheadline),
    description: getString(raw.description),
    body: getString(raw.body) ?? getString(raw.html),
    imageMediaId:
      typeof raw.imageMediaId === 'string'
        ? raw.imageMediaId
        : raw.imageMediaId === null
          ? null
          : undefined,
    imageUrl: getString(raw.imageUrl),
    ctaLabel: getString(raw.ctaLabel),
    ctaUrl: getString(raw.ctaUrl),
    secondaryCtaLabel: getString(raw.secondaryCtaLabel),
    secondaryCtaUrl: getString(raw.secondaryCtaUrl),
    linkUrl: getString(raw.linkUrl),
    slides: parseObjectArray(raw.slides, parseSlideItem),
    badges: parseObjectArray(raw.badges, parseBadgeItem),
    faqItems: parseObjectArray(raw.faqItems, parseFaqItem),
    testimonials: parseObjectArray(raw.testimonials, parseTestimonialItem),
    brandLogos: parseObjectArray(raw.brandLogos, parseBrandLogoItem),
    formKey: getString(raw.formKey),
    campaignId: getString(raw.campaignId),
    emailPlaceholder: getString(raw.emailPlaceholder),
    buttonLabel: getString(raw.buttonLabel),
    successMessage: getString(raw.successMessage),
  };
}

export function getActiveSlides(content: ParsedBlockContent): BlockSlideItem[] {
  const slides = content.slides ?? [];
  return slides
    .filter((slide) => slide.isActive !== false)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export function getHeroVariant(
  block: Pick<PublicPageBlockDto, 'type' | 'settings' | 'content'>,
): HeroVariant {
  if (block.type === 'HERO_SLIDER') return 'CAROUSEL_SLIDER';
  const settings = parseBlockSettings(block.settings);
  if (settings.variant) return settings.variant;

  const slides = parseBlockContent(block.content).slides ?? [];
  if (slides.length > 0) return 'CAROUSEL_SLIDER';

  return 'SIMPLE';
}

export function getProductDisplayMode(
  block: Pick<PublicPageBlockDto, 'type' | 'settings'>,
): ProductDisplayMode {
  if (block.type === 'PRODUCT_CAROUSEL') return 'CAROUSEL';
  const settings = parseBlockSettings(block.settings);
  return normalizeProductDisplayMode(settings.displayMode);
}

export function getBlogDisplayMode(
  block: Pick<PublicPageBlockDto, 'settings'>,
): BlogDisplayMode {
  const settings = parseBlockSettings(block.settings);
  return normalizeBlogDisplayMode(settings.displayMode);
}

export function migrateHeroToCarouselContent(
  content: Record<string, unknown>,
): Record<string, unknown> {
  const parsed = parseBlockContent(content);
  if (parsed.slides?.length) {
    return content;
  }

  const hasRootContent =
    parsed.headline ||
    parsed.subheadline ||
    parsed.description ||
    parsed.imageUrl ||
    parsed.ctaLabel;

  if (!hasRootContent) {
    return { ...content, slides: [] };
  }

  return {
    ...content,
    slides: [
      {
        headline: parsed.headline,
        subheadline: parsed.subheadline,
        description: parsed.description,
        ctaLabel: parsed.ctaLabel,
        ctaUrl: parsed.ctaUrl,
        secondaryCtaLabel: parsed.secondaryCtaLabel,
        secondaryCtaUrl: parsed.secondaryCtaUrl,
        imageUrl: parsed.imageUrl,
        imageMediaId: parsed.imageMediaId,
        isActive: true,
        sortOrder: 0,
      },
    ],
  };
}

export function getBlockDisplayTitle(block: {
  title: string | null;
  content: Record<string, unknown>;
}): string {
  return (
    block.title?.trim() ||
    parseBlockContent(block.content).headline ||
    'Adsız blok'
  );
}

export function toPublicBlockDto(block: PageBlockDto): PublicPageBlockDto {
  return {
    id: block.id,
    type: block.type,
    title: block.title,
    settings: block.settings,
    content: block.content,
  };
}

export const DEFAULT_BLOCK_CONTENT: Partial<
  Record<PageBlockType, Record<string, unknown>>
> = {
  HERO: {
    headline: '',
    subheadline: '',
    ctaLabel: '',
    ctaUrl: '',
    secondaryCtaLabel: '',
    secondaryCtaUrl: '',
  },
  HERO_SLIDER: { slides: [] },
  TEXT: { body: '' },
  TEXT_IMAGE: { headline: '', description: '' },
  IMAGE_BANNER: { headline: '', linkUrl: '' },
  PRODUCT_GRID: { headline: '', description: '' },
  PRODUCT_CAROUSEL: { headline: '', description: '' },
  CATEGORY_GRID: { headline: '', description: '' },
  BLOG_GRID: { headline: '', description: '' },
  TRUST_BADGES: { headline: '', badges: [] },
  FAQ: { headline: '' },
  CONTACT_FORM: { headline: '', description: '', formKey: '' },
  BRAND_LOGOS: { headline: '' },
  TESTIMONIALS: { headline: '' },
  NEWSLETTER: {
    headline: '',
    description: '',
    emailPlaceholder: '',
    buttonLabel: '',
    successMessage: '',
  },
  CUSTOM_SPACER: {},
  CAMPAIGN: { campaignId: '' },
};

export const DEFAULT_BLOCK_SETTINGS: Partial<
  Record<PageBlockType, Record<string, unknown>>
> = {
  HERO: {
    variant: 'SIMPLE',
    containerMode: 'CONTAINER',
    paddingTop: '0',
    paddingBottom: '0',
    desktopHeight: 'auto',
    mobileHeight: 'auto',
    backgroundType: 'NONE',
    desktopVisible: true,
    mobileVisible: true,
  },
  HERO_SLIDER: {
    variant: 'CAROUSEL_SLIDER',
    containerMode: 'FULL_WIDTH',
    desktopHeight: '480px',
    mobileHeight: '320px',
    slider: {
      autoplay: true,
      autoplayDelay: 6000,
      showDots: true,
      showArrows: true,
      transitionEffect: 'FADE',
      loop: true,
    },
  },
  IMAGE_BANNER: { fullWidth: true, containerMode: 'FULL_WIDTH', desktopHeight: '320px' },
  PRODUCT_GRID: {
    displayMode: 'GRID',
    itemCount: 8,
    columns: 4,
    columnsTablet: 2,
    columnsMobile: 1,
    productKind: 'SOFTWARE',
    source: 'ALL',
    showPrice: true,
    showBadge: true,
    showDescription: true,
    showCta: true,
    cardStyle: 'PREMIUM',
  },
  PRODUCT_CAROUSEL: {
    displayMode: 'CAROUSEL',
    itemCount: 12,
    columns: 4,
    showPrice: true,
    showBadge: true,
    showDescription: true,
    showCta: true,
    cardStyle: 'PREMIUM',
    slider: { autoplay: false, showDots: true, showArrows: true },
  },
  CATEGORY_GRID: { itemCount: 6, columns: 3 },
  BLOG_GRID: {
    displayMode: 'GRID',
    itemCount: 3,
    columns: 3,
    showCover: true,
    showExcerpt: true,
    showDate: true,
    showCategory: true,
    cardStyle: 'PREMIUM',
  },
  CUSTOM_SPACER: { height: '2rem' },
};

export function createDefaultBlockPayload(type: PageBlockType): {
  title: string;
  settings: Record<string, unknown>;
  content: Record<string, unknown>;
} {
  const content = { ...(DEFAULT_BLOCK_CONTENT[type] ?? {}) };
  const settings = { ...(DEFAULT_BLOCK_SETTINGS[type] ?? {}) };
  const headline = getString(content.headline);

  return {
    title: headline ?? '',
    settings,
    content,
  };
}

export function blocksSnapshot(blocks: PageBlockDto[]): string {
  return JSON.stringify(
    blocks.map((block) => ({
      id: block.id,
      type: block.type,
      title: block.title,
      settings: block.settings,
      content: block.content,
      sortOrder: block.sortOrder,
      isActive: block.isActive,
    })),
  );
}

export function sortBlocks(blocks: PageBlockDto[]): PageBlockDto[] {
  return [...blocks].sort((a, b) => a.sortOrder - b.sortOrder);
}
