import type { SeoSettingPublicDto, SiteSettingDto } from '@/shared/types/api';

export interface EntitySeoFields {
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImageUrl?: string | null;
  canonicalUrl?: string | null;
  robotsIndex?: boolean;
}

export function resolveSeoTitle(
  entity: EntitySeoFields | undefined,
  seoSettings?: SeoSettingPublicDto,
  siteSettings?: SiteSettingDto,
): string {
  return (
    entity?.seoTitle?.trim() ||
    seoSettings?.defaultTitle?.trim() ||
    siteSettings?.defaultSeoTitle?.trim() ||
    siteSettings?.siteName?.trim() ||
    ''
  );
}

export function resolveSeoDescription(
  entity: EntitySeoFields | undefined,
  seoSettings?: SeoSettingPublicDto,
  siteSettings?: SiteSettingDto,
): string {
  return (
    entity?.seoDescription?.trim() ||
    seoSettings?.defaultDescription?.trim() ||
    siteSettings?.defaultSeoDescription?.trim() ||
    siteSettings?.siteDescription?.trim() ||
    ''
  );
}

export function resolveOgImageUrl(
  entity: EntitySeoFields | undefined,
  seoSettings?: SeoSettingPublicDto,
  siteSettings?: SiteSettingDto,
  imageFallback?: string | null,
): string | undefined {
  return (
    entity?.ogImageUrl?.trim() ||
    imageFallback?.trim() ||
    seoSettings?.defaultOgImageUrl?.trim() ||
    siteSettings?.ogImageUrl?.trim() ||
    undefined
  );
}

export function buildCanonicalUrl(
  entityCanonical: string | null | undefined,
  pathname: string,
  seoSettings?: SeoSettingPublicDto,
  siteSettings?: SiteSettingDto,
): string | undefined {
  if (entityCanonical?.trim()) {
    return entityCanonical.trim();
  }

  const base =
    seoSettings?.canonicalBaseUrl?.replace(/\/$/, '') ||
    siteSettings?.domain?.replace(/\/$/, '');

  if (!base) return undefined;

  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${base}${path}`;
}
