import type { PageDto, SeoSettingPublicDto, SiteSettingDto } from '@/shared/types/api';
import {
  resolveSeoDescription,
  resolveSeoTitle,
} from '@/shared/lib/seo-meta';

interface StorefrontPageHeadingProps {
  cmsPage?: PageDto | null;
  seoSettings?: SeoSettingPublicDto;
  siteSettings?: SiteSettingDto;
  fallbackQuery?: string;
}

export function StorefrontPageHeading({
  cmsPage,
  seoSettings,
  siteSettings,
  fallbackQuery,
}: StorefrontPageHeadingProps) {
  const title =
    cmsPage?.title?.trim() ||
    resolveSeoTitle(
      cmsPage
        ? {
            seoTitle: cmsPage.seoTitle,
            seoDescription: cmsPage.seoDescription,
          }
        : undefined,
      seoSettings,
      siteSettings,
    ) ||
    fallbackQuery ||
    '';

  const description =
    cmsPage?.excerpt?.trim() ||
    resolveSeoDescription(
      cmsPage
        ? {
            seoDescription: cmsPage.seoDescription,
          }
        : undefined,
      seoSettings,
      siteSettings,
    );

  if (!title && !description) return null;

  return (
    <header className="mb-6">
      {title ? (
        <h1 className="theme-heading text-2xl sm:text-3xl">{title}</h1>
      ) : null}
      {description ? (
        <p className="mt-2 text-theme-muted">{description}</p>
      ) : null}
    </header>
  );
}
