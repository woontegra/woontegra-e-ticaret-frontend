import { Link, useLocation, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPublicProductCategory } from '@/shared/api/products.api';
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

export function CategoryDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const siteQuery = usePublicSiteSettings();
  const { seoSettings } = usePageSeo();
  const ui = useStorefrontUi();
  const notFoundMessage = uiLabel(ui, 'categoryNotFound');
  const backLink = uiLabel(ui, 'productListBackLink');

  const categoryQuery = useQuery({
    queryKey: ['public', 'categories', slug],
    queryFn: () => getPublicProductCategory(slug!),
    enabled: Boolean(slug),
  });

  const category = categoryQuery.data;

  if (categoryQuery.isPending) {
    return (
      <div className="mx-auto max-w-6xl animate-pulse space-y-4">
        <div className="h-8 w-1/3 rounded bg-slate-100" />
        <div className="h-64 rounded bg-slate-100" />
      </div>
    );
  }

  if (categoryQuery.isError || !category) {
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

  const productCountText =
    category.productCount !== undefined
      ? uiLabelFormat(ui, 'catalogProductCountSuffix', {
          count: category.productCount,
        })
      : undefined;

  return (
    <>
      <SeoHead
        siteSettings={siteQuery.data}
        seoSettings={seoSettings}
        title={resolveSeoTitle(
          { seoTitle: category.seoTitle },
          seoSettings,
          siteQuery.data,
        )}
        description={resolveSeoDescription(
          { seoDescription: category.seoDescription },
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
        {category.bannerImageUrl ? (
          <img
            src={category.bannerImageUrl}
            alt={category.name}
            className="mb-6 w-full rounded-lg object-cover"
          />
        ) : null}

        <h1 className="theme-heading text-2xl sm:text-3xl">{category.name}</h1>
        {category.description ? (
          <p className="mt-2 text-theme-muted">{category.description}</p>
        ) : null}
        {productCountText ? (
          <p className="mt-1 text-sm text-theme-muted">{productCountText}</p>
        ) : null}

        <ProductListingView
          defaultCategory={category.slug}
          lockCategory={category.slug}
        />
      </div>
    </>
  );
}
