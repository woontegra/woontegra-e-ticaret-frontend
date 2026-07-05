import type { ProductKind } from '@/shared/types/api';
import { SeoHead } from '@/storefront/components/SeoHead';
import { ProductListingView } from '@/storefront/components/catalog/ProductListingView';
import { usePublicSiteSettings } from '@/storefront/hooks/usePublicSettings';

interface ProductsIndexPageProps {
  productKind?: ProductKind;
  title?: string;
  description?: string;
}

export function ProductsIndexPage({
  productKind,
  title,
  description,
}: ProductsIndexPageProps) {
  const siteQuery = usePublicSiteSettings();

  const pageTitle =
    title ?? (productKind === 'SOFTWARE' ? 'Yazılımlar' : 'Ürünler');
  const pageDescription =
    description ??
    (productKind === 'SOFTWARE'
      ? 'Woontegra yazılım çözümlerini keşfedin.'
      : 'Ürün kataloğumuzu inceleyin.');

  return (
    <>
      <SeoHead
        siteSettings={siteQuery.data}
        title={
          siteQuery.data?.siteName
            ? `${pageTitle} | ${siteQuery.data.siteName}`
            : pageTitle
        }
        description={pageDescription}
      />

      <div className="mx-auto max-w-6xl">
        <h1 className="theme-heading text-2xl sm:text-3xl">{pageTitle}</h1>
        <p className="mt-2 text-theme-muted">{pageDescription}</p>

        <ProductListingView productKind={productKind} />
      </div>
    </>
  );
}
