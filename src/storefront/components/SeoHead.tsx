import { useEffect } from 'react';
import type { SeoSettingPublicDto, SiteSettingDto } from '@/shared/types/api';

interface SeoHeadProps {
  siteSettings?: SiteSettingDto;
  seoSettings?: SeoSettingPublicDto;
  title?: string;
  description?: string;
  ogImageUrl?: string;
  canonicalUrl?: string;
  robotsIndex?: boolean;
}

function upsertMeta(
  selector: string,
  attributes: Record<string, string>,
): void {
  let element = document.querySelector(selector);

  if (!element) {
    element = document.createElement('meta');
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

function injectGoogleAnalytics(measurementId: string): void {
  const scriptId = 'woontegra-ga-script';
  if (document.getElementById(scriptId)) return;

  const script = document.createElement('script');
  script.id = scriptId;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  const inline = document.createElement('script');
  inline.id = 'woontegra-ga-inline';
  inline.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}');
  `;
  document.head.appendChild(inline);
}

function injectMetaPixel(pixelId: string): void {
  if (document.getElementById('woontegra-meta-pixel')) return;

  const script = document.createElement('script');
  script.id = 'woontegra-meta-pixel';
  script.textContent = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${pixelId}');
    fbq('track', 'PageView');
  `;
  document.head.appendChild(script);
}

export function SeoHead({
  siteSettings,
  seoSettings,
  title,
  description,
  ogImageUrl,
  canonicalUrl,
  robotsIndex = true,
}: SeoHeadProps) {
  const pageTitle =
    title ||
    seoSettings?.defaultTitle ||
    siteSettings?.defaultSeoTitle ||
    siteSettings?.siteName ||
    '';
  const pageDescription =
    description ||
    seoSettings?.defaultDescription ||
    siteSettings?.defaultSeoDescription ||
    siteSettings?.siteDescription ||
    '';
  const imageUrl =
    ogImageUrl || seoSettings?.defaultOgImageUrl || siteSettings?.ogImageUrl || undefined;
  const gaId = seoSettings?.googleAnalyticsId?.trim();
  const pixelId = seoSettings?.metaPixelId?.trim();

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

    if (canonicalUrl) {
      upsertLink('canonical', canonicalUrl);
    }

    if (siteSettings?.faviconUrl) {
      upsertLink('icon', siteSettings.faviconUrl);
    }
  }, [
    pageTitle,
    pageDescription,
    siteSettings?.faviconUrl,
    imageUrl,
    robotsIndex,
    canonicalUrl,
  ]);

  useEffect(() => {
    if (gaId) {
      injectGoogleAnalytics(gaId);
    }
  }, [gaId]);

  useEffect(() => {
    if (pixelId) {
      injectMetaPixel(pixelId);
    }
  }, [pixelId]);

  return null;
}
