import type { ProductKind } from '@/shared/types/api';
import { useLocation } from 'react-router-dom';
import { SeoHead } from '@/storefront/components/SeoHead';
import { SoftwareCatalogHero } from '@/storefront/components/catalog/SoftwareCatalogHero';
import { ProductListingView } from '@/storefront/components/catalog/ProductListingView';
import { useOptionalPublicPage } from '@/storefront/hooks/useOptionalPublicPage';
import { usePageSeo } from '@/storefront/hooks/usePageSeo';
import {
  buildCanonicalUrl,
  resolveSeoDescription,
  resolveSeoTitle,
} from '@/shared/lib/seo-meta';
import { usePublicSiteSettings } from '@/storefront/hooks/usePublicSettings';

interface ProductsIndexPageProps {
  productKind?: ProductKind;
  cmsSlug?: string;
}

export function ProductsIndexPage({
  productKind,
  cmsSlug,
}: ProductsIndexPageProps) {
  const location = useLocation();
  const siteQuery = usePublicSiteSettings();
  const { seoSettings } = usePageSeo();
  const slug =
    cmsSlug ?? (productKind === 'SOFTWARE' ? 'yazilimlar' : 'urunler');
  const cmsQuery = useOptionalPublicPage(slug);
  const cmsPage = cmsQuery.data;
  const isSoftwareCatalog = productKind === 'SOFTWARE';

  return (
    <>
      <SeoHead
        siteSettings={siteQuery.data}
        seoSettings={seoSettings}
        title={resolveSeoTitle(
          cmsPage
            ? {
                seoTitle: cmsPage.seoTitle,
                seoDescription: cmsPage.seoDescription,
              }
            : isSoftwareCatalog
              ? {
                  seoTitle: 'Woontegra Yazılımları',
                  seoDescription:
                    'İşletmeler için geliştirilen indirilebilir ve web tabanlı yazılım çözümleri.',
                }
              : undefined,
          seoSettings,
          siteQuery.data,
        )}
        description={resolveSeoDescription(
          cmsPage
            ? { seoDescription: cmsPage.seoDescription }
            : isSoftwareCatalog
              ? {
                  seoDescription:
                    'Ücretsiz araçlar, lisanslı masaüstü yazılımlar ve SaaS abonelik çözümleri.',
                }
              : undefined,
          seoSettings,
          siteQuery.data,
        )}
        canonicalUrl={buildCanonicalUrl(
          cmsPage?.canonicalUrl,
          location.pathname,
          seoSettings,
          siteQuery.data,
        )}
        robotsIndex={cmsPage?.robotsIndex ?? true}
      />

      <div className="mx-auto max-w-6xl">
        {isSoftwareCatalog ? (
          <div className="mb-6">
            <SoftwareCatalogHero />
          </div>
        ) : null}

        <ProductListingView productKind={productKind} />
      </div>
    </>
  );
}
