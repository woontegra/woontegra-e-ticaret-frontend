import type { PageBlockDto, PageBlockType, PublicPageBlockDto } from '@/shared/types/api';

export type BlockAlignment = 'left' | 'center' | 'right';

export interface ParsedBlockSettings {
  backgroundColor?: string;
  textColor?: string;
  alignment: BlockAlignment;
  fullWidth: boolean;
  paddingTop?: string;
  paddingBottom?: string;
  desktopHeight?: string;
  mobileHeight?: string;
  showOnMobile: boolean;
  itemCount?: number;
  columns?: number;
  height?: string;
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
  imageUrl?: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

export interface BlockBadgeItem {
  label: string;
  description?: string;
  iconUrl?: string;
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

export function parseBlockSettings(
  raw: Record<string, unknown>,
): ParsedBlockSettings {
  const alignment = getString(raw.alignment);
  const validAlignment: BlockAlignment =
    alignment === 'center' || alignment === 'right' ? alignment : 'left';

  return {
    backgroundColor: getString(raw.backgroundColor),
    textColor: getString(raw.textColor),
    alignment: validAlignment,
    fullWidth: getBoolean(raw.fullWidth, false),
    paddingTop: getString(raw.paddingTop),
    paddingBottom: getString(raw.paddingBottom),
    desktopHeight: getString(raw.desktopHeight),
    mobileHeight: getString(raw.mobileHeight),
    showOnMobile: getBoolean(raw.showOnMobile ?? raw.mobileVisible, true),
    itemCount: getNumber(raw.itemCount),
    columns: getNumber(raw.columns),
    height: getString(raw.height),
  };
}

function parseSlideItem(value: unknown): BlockSlideItem | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  const headline = getString(item.headline);
  const imageUrl = getString(item.imageUrl);
  if (!headline && !imageUrl) return null;

  return {
    headline,
    subheadline: getString(item.subheadline),
    description: getString(item.description),
    imageUrl,
    ctaLabel: getString(item.ctaLabel),
    ctaUrl: getString(item.ctaUrl),
  };
}

function parseBadgeItem(value: unknown): BlockBadgeItem | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  const label = getString(item.label);
  if (!label) return null;

  return {
    label,
    description: getString(item.description),
    iconUrl: getString(item.iconUrl),
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
  },
  HERO_SLIDER: {
    headline: '',
    subheadline: '',
  },
  TEXT: {
    body: '',
  },
  TEXT_IMAGE: {
    headline: '',
    description: '',
  },
  IMAGE_BANNER: {
    headline: '',
    linkUrl: '',
  },
  PRODUCT_GRID: {
    headline: '',
    description: '',
  },
  PRODUCT_CAROUSEL: {
    headline: '',
    description: '',
  },
  CATEGORY_GRID: {
    headline: '',
    description: '',
  },
  BLOG_GRID: {
    headline: '',
    description: '',
  },
  TRUST_BADGES: {
    headline: '',
  },
  FAQ: {
    headline: '',
  },
  CONTACT_FORM: {
    headline: '',
    description: '',
    formKey: '',
  },
  BRAND_LOGOS: {
    headline: '',
  },
  TESTIMONIALS: {
    headline: '',
  },
  NEWSLETTER: {
    headline: '',
    description: '',
    emailPlaceholder: '',
    buttonLabel: '',
    successMessage: '',
  },
  CUSTOM_SPACER: {},
  CAMPAIGN: {
    campaignId: '',
  },
};

export const DEFAULT_BLOCK_SETTINGS: Partial<
  Record<PageBlockType, Record<string, unknown>>
> = {
  HERO: { paddingTop: '2rem', paddingBottom: '2rem', desktopHeight: '420px' },
  HERO_SLIDER: { fullWidth: true, desktopHeight: '480px' },
  IMAGE_BANNER: { fullWidth: true, desktopHeight: '320px' },
  PRODUCT_GRID: { itemCount: 8, columns: 4 },
  PRODUCT_CAROUSEL: { itemCount: 12, columns: 4 },
  CATEGORY_GRID: { itemCount: 6, columns: 3 },
  BLOG_GRID: { itemCount: 3, columns: 3 },
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
