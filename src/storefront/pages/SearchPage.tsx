import { useLocation, useSearchParams } from 'react-router-dom';
import { SeoHead } from '@/storefront/components/SeoHead';
import { StorefrontPageHeading } from '@/storefront/components/StorefrontPageHeading';
import { ProductListingView } from '@/storefront/components/catalog/ProductListingView';
import { useOptionalPublicPage } from '@/storefront/hooks/useOptionalPublicPage';
import { usePageSeo } from '@/storefront/hooks/usePageSeo';
import {
  buildCanonicalUrl,
  resolveSeoDescription,
  resolveSeoTitle,
} from '@/shared/lib/seo-meta';
import { usePublicSiteSettings } from '@/storefront/hooks/usePublicSettings';

export function SearchPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q')?.trim() ?? '';
  const siteQuery = usePublicSiteSettings();
  const { seoSettings } = usePageSeo();
  const cmsQuery = useOptionalPublicPage('arama');

  const entitySeo = cmsQuery.data
    ? {
        seoTitle: cmsQuery.data.seoTitle,
        seoDescription: cmsQuery.data.seoDescription,
      }
    : query
      ? {
          seoTitle: query,
          seoDescription: undefined,
        }
      : undefined;

  return (
    <>
      <SeoHead
        siteSettings={siteQuery.data}
        seoSettings={seoSettings}
        title={resolveSeoTitle(entitySeo, seoSettings, siteQuery.data)}
        description={resolveSeoDescription(entitySeo, seoSettings, siteQuery.data)}
        canonicalUrl={buildCanonicalUrl(
          cmsQuery.data?.canonicalUrl,
          location.pathname + location.search,
          seoSettings,
          siteQuery.data,
        )}
        robotsIndex={cmsQuery.data?.robotsIndex ?? true}
      />

      <div className="mx-auto max-w-6xl">
        <StorefrontPageHeading
          cmsPage={cmsQuery.data}
          seoSettings={seoSettings}
          siteSettings={siteQuery.data}
          fallbackQuery={query || undefined}
        />

        <ProductListingView />
      </div>
    </>
  );
}
