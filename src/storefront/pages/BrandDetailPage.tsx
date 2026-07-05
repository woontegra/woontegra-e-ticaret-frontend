import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPublicBrand } from '@/shared/api/products.api';
import { ProductListingView } from '@/storefront/components/catalog/ProductListingView';
import { SeoHead } from '@/storefront/components/SeoHead';
import { usePublicSiteSettings } from '@/storefront/hooks/usePublicSettings';

export function BrandDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const siteQuery = usePublicSiteSettings();

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
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-theme-muted">Marka bulunamadı.</p>
        <Link to="/urunler" className="mt-4 inline-block text-sm hover:underline">
          ← Ürünlere dön
        </Link>
      </div>
    );
  }

  return (
    <>
      <SeoHead
        siteSettings={siteQuery.data}
        title={
          brand.seoTitle ||
          (siteQuery.data?.siteName
            ? `${brand.name} | ${siteQuery.data.siteName}`
            : brand.name)
        }
        description={brand.seoDescription || brand.description || undefined}
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
            <p className="mt-1 text-sm text-theme-muted">
              {brand.productCount} ürün
            </p>
          </div>
        </div>

        <ProductListingView defaultBrand={brand.slug} lockBrand={brand.slug} />
      </div>
    </>
  );
}
