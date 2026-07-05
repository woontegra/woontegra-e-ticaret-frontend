import { SeoHead } from '@/storefront/components/SeoHead';
import { HomeLayoutRenderer } from '@/storefront/blocks/HomeLayoutRenderer';
import { HomeLayoutEmptyState } from '@/storefront/blocks/HomeLayoutEmptyState';
import { HomeLayoutSkeleton } from '@/storefront/blocks/HomeLayoutSkeleton';
import { usePublicHomeLayout } from '@/storefront/hooks/usePublicHomeLayout';
import { usePublicSiteSettings } from '@/storefront/hooks/usePublicSettings';

export function StorefrontIndexPage() {
  const siteQuery = usePublicSiteSettings();
  const layoutQuery = usePublicHomeLayout();

  const hasPublishedBlocks =
    layoutQuery.isSuccess &&
    layoutQuery.data !== null &&
    layoutQuery.data.blocks.length > 0;

  return (
    <>
      <SeoHead siteSettings={siteQuery.data} />
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
