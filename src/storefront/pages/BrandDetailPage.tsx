import { Link, useLocation, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPublicBrand } from '@/shared/api/products.api';
import { ProductListingView } from '@/storefront/components/catalog/ProductListingView';
import { SeoHead } from '@/storefront/components/SeoHead';
import { usePageSeo } from '@/storefront/hooks/usePageSeo';
import {
  buildCanonicalUrl,
  resolveSeoDescription,
  resolveSeoTitle,
} from '@/shared/lib/seo-meta';
import { usePublicSiteSettings } from '@/storefront/hooks/usePublicSettings';
import { uiLabel, uiLabelFormat } from '@/shared/lib/storefront-ui';
import { useStorefrontUi } from '@/storefront/hooks/useStorefrontUi';

export function BrandDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const siteQuery = usePublicSiteSettings();
  const { seoSettings } = usePageSeo();
  const ui = useStorefrontUi();
  const notFoundMessage = uiLabel(ui, 'brandNotFound');
  const backLink = uiLabel(ui, 'productListBackLink');

  const brandQuery = useQuery({
    queryKey: ['public', 'brands', slug],
    queryFn: () => getPublicBrand(slug!),
    enabled: Boolean(slug),
  });

  const brand = brandQuery.data;

  if (brandQuery.isPending) {
    return (
      <div className="mx-auto max-w-6xl animate-pulse space-y-4">
        <div className="h-8 w-1/3 rounded bg-slate-100" />
        <div className="h-64 rounded bg-slate-100" />
      </div>
    );
  }

  if (brandQuery.isError || !brand) {
    if (!notFoundMessage && !backLink) {
      return null;
    }

    return (
      <div className="py-16 text-center">
        {notFoundMessage ? (
          <p className="text-sm text-theme-muted">{notFoundMessage}</p>
        ) : null}
        {backLink ? (
          <Link to="/urunler" className="mt-4 inline-block text-sm hover:underline">
            {backLink}
          </Link>
        ) : null}
      </div>
    );
  }

  const productCountText = uiLabelFormat(ui, 'catalogProductCountSuffix', {
    count: brand.productCount,
  });

  return (
    <>
      <SeoHead
        siteSettings={siteQuery.data}
        seoSettings={seoSettings}
        title={resolveSeoTitle(
          { seoTitle: brand.seoTitle },
          seoSettings,
          siteQuery.data,
        )}
        description={resolveSeoDescription(
          { seoDescription: brand.seoDescription },
          seoSettings,
          siteQuery.data,
        )}
        canonicalUrl={buildCanonicalUrl(
          null,
          location.pathname,
          seoSettings,
          siteQuery.data,
        )}
      />

      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center gap-4">
          {brand.logoUrl ? (
            <img
              src={brand.logoUrl}
              alt={brand.name}
              className="h-16 w-16 rounded-lg object-contain"
            />
          ) : null}
          <div>
            <h1 className="theme-heading text-2xl sm:text-3xl">{brand.name}</h1>
            {brand.description ? (
              <p className="mt-1 text-theme-muted">{brand.description}</p>
            ) : null}
            {productCountText ? (
              <p className="mt-1 text-sm text-theme-muted">{productCountText}</p>
            ) : null}
          </div>
        </div>

        <ProductListingView defaultBrand={brand.slug} lockBrand={brand.slug} />
      </div>
    </>
  );
}
