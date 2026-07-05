import { useEffect } from 'react';
import type { SiteSettingDto } from '@/shared/types/api';

interface SeoHeadProps {
  siteSettings?: SiteSettingDto;
  title?: string;
  description?: string;
  ogImageUrl?: string;
  robotsIndex?: boolean;
}

function upsertMeta(
  selector: string,
  attributes: Record<string, string>,
): void {
  let element = document.querySelector(selector);

  if (!element) {
    const tag = selector.includes('property=') ? 'meta' : 'meta';
    element = document.createElement(tag);
    for (const [key, value] of Object.entries(attributes)) {
      element.setAttribute(key, value);
    }
    document.head.appendChild(element);
    return;
  }

  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value);
  }
}

function upsertLink(rel: string, href: string): void {
  let link = document.querySelector(`link[rel='${rel}']`) as HTMLLinkElement | null;

  if (!link) {
    link = document.createElement('link');
    link.rel = rel;
    document.head.appendChild(link);
  }

  link.href = href;
}

export function SeoHead({
  siteSettings,
  title,
  description,
  ogImageUrl,
  robotsIndex = true,
}: SeoHeadProps) {
  const pageTitle = title || siteSettings?.defaultSeoTitle || siteSettings?.siteName || '';
  const pageDescription =
    description ||
    siteSettings?.defaultSeoDescription ||
    siteSettings?.siteDescription ||
    '';
  const imageUrl = ogImageUrl || siteSettings?.ogImageUrl || undefined;

  useEffect(() => {
    if (pageTitle) {
      document.title = pageTitle;
    }

    upsertMeta('meta[name="description"]', {
      name: 'description',
      content: pageDescription,
    });

    if (pageTitle) {
      upsertMeta('meta[property="og:title"]', {
        property: 'og:title',
        content: pageTitle,
      });
    }

    if (pageDescription) {
      upsertMeta('meta[property="og:description"]', {
        property: 'og:description',
        content: pageDescription,
      });
    }

    if (imageUrl) {
      upsertMeta('meta[property="og:image"]', {
        property: 'og:image',
        content: imageUrl,
      });
    }

    upsertMeta('meta[name="robots"]', {
      name: 'robots',
      content: robotsIndex ? 'index, follow' : 'noindex, nofollow',
    });

    if (siteSettings?.faviconUrl) {
      upsertLink('icon', siteSettings.faviconUrl);
    }
  }, [
    pageTitle,
    pageDescription,
    siteSettings?.faviconUrl,
    imageUrl,
    robotsIndex,
  ]);

  return null;
}
