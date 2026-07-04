import { useEffect } from 'react';
import type { SiteSettingDto } from '@woontegra/shared';

interface SeoHeadProps {
  siteSettings?: SiteSettingDto;
  title?: string;
  description?: string;
}

export function SeoHead({ siteSettings, title, description }: SeoHeadProps) {
  const pageTitle = title || siteSettings?.defaultSeoTitle || siteSettings?.siteName || '';
  const pageDescription =
    description ||
    siteSettings?.defaultSeoDescription ||
    siteSettings?.siteDescription ||
    '';

  useEffect(() => {
    if (pageTitle) {
      document.title = pageTitle;
    }

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', pageDescription);

    if (siteSettings?.faviconUrl) {
      let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = siteSettings.faviconUrl;
    }
  }, [pageTitle, pageDescription, siteSettings?.faviconUrl]);

  return null;
}
