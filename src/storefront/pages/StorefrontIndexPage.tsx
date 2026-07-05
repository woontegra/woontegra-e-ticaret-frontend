import { SeoHead } from '@/storefront/components/SeoHead';
import { HomeLayoutRenderer } from '@/storefront/blocks/HomeLayoutRenderer';
import { HomeLayoutEmptyState } from '@/storefront/blocks/HomeLayoutEmptyState';
import { HomeLayoutSkeleton } from '@/storefront/blocks/HomeLayoutSkeleton';
import { usePublicHomeLayout } from '@/storefront/hooks/usePublicHomeLayout';
import { usePageSeo } from '@/storefront/hooks/usePageSeo';
import {
  buildCanonicalUrl,
  resolveSeoDescription,
  resolveSeoTitle,
} from '@/shared/lib/seo-meta';
import { useLocation } from 'react-router-dom';
import { usePublicSiteSettings } from '@/storefront/hooks/usePublicSettings';

export function StorefrontIndexPage() {
  const location = useLocation();
  const siteQuery = usePublicSiteSettings();
  const { seoSettings } = usePageSeo();
  const layoutQuery = usePublicHomeLayout();

  const hasPublishedBlocks =
    layoutQuery.isSuccess &&
    layoutQuery.data !== null &&
    layoutQuery.data.blocks.length > 0;

  return (
    <>
      <SeoHead
        siteSettings={siteQuery.data}
        seoSettings={seoSettings}
        title={resolveSeoTitle(undefined, seoSettings, siteQuery.data)}
        description={resolveSeoDescription(undefined, seoSettings, siteQuery.data)}
        canonicalUrl={buildCanonicalUrl(
          null,
          location.pathname,
          seoSettings,
          siteQuery.data,
        )}
      />
      {layoutQuery.isPending ? (
        <HomeLayoutSkeleton />
      ) : hasPublishedBlocks ? (
        <HomeLayoutRenderer blocks={layoutQuery.data!.blocks} />
      ) : (
        <HomeLayoutEmptyState />
      )}
    </>
  );
}
