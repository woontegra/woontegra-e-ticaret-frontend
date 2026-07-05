import { Link, useLocation } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { formatMoney } from '@/shared/api/cart.api';
import { getProductPublicPath } from '@/shared/api/products.api';
import { useCart } from '@/storefront/hooks/useCart';
import { SeoHead } from '@/storefront/components/SeoHead';
import { StorefrontPageHeading } from '@/storefront/components/StorefrontPageHeading';
import { useOptionalPublicPage } from '@/storefront/hooks/useOptionalPublicPage';
import { usePageSeo } from '@/storefront/hooks/usePageSeo';
import {
  buildCanonicalUrl,
  resolveSeoDescription,
  resolveSeoTitle,
} from '@/shared/lib/seo-meta';
import { usePublicSiteSettings } from '@/storefront/hooks/usePublicSettings';

export function CartPage() {
  const location = useLocation();
  const siteQuery = usePublicSiteSettings();
  const { seoSettings } = usePageSeo();
  const cmsQuery = useOptionalPublicPage('sepet');
  const cmsPage = cmsQuery.data;
  const { cart, isLoading, updateMutation, removeMutation } = useCart();

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
            : undefined,
          seoSettings,
          siteQuery.data,
        )}
        description={resolveSeoDescription(
          cmsPage ? { seoDescription: cmsPage.seoDescription } : undefined,
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

      <div className="mx-auto max-w-4xl">
        <StorefrontPageHeading
          cmsPage={cmsPage}
          seoSettings={seoSettings}
          siteSettings={siteQuery.data}
        />

        {isLoading ? (
          <div className="mt-8 space-y-4 animate-pulse">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-24 rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : !cart || cart.items.length === 0 ? (
          <div className="mt-10 text-center">
            <p className="text-sm text-theme-muted">Sepetiniz boş.</p>
            <Link to="/" className="theme-link mt-4 inline-block text-sm">
              ← Ana sayfa
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_280px]">
            <div className="space-y-4">
              {cart.items.map((item) => (
                <article
                  key={item.id}
                  className="theme-card flex gap-4 rounded-lg border border-slate-200 p-4"
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.lineLabel}
                      className="h-20 w-20 rounded-md object-cover"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-md bg-slate-100" />
                  )}
                  <div className="min-w-0 flex-1">
                    <Link
                      to={getProductPublicPath({
                        slug: item.productSlug,
                        productKind: item.productKind,
                      })}
                      className="font-medium hover:underline"
                    >
                      {item.lineLabel}
                    </Link>
                    <p className="mt-1 text-sm text-theme-muted">
                      {formatMoney(item.unitPrice)}
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <label className="text-sm text-slate-600">
                        Adet
                        <input
                          type="number"
                          min={1}
                          max={99}
                          value={item.quantity}
                          disabled={updateMutation.isPending}
                          onChange={(event) => {
                            const quantity = Number(event.target.value);
                            if (quantity > 0) {
                              updateMutation.mutate({ id: item.id, quantity });
                            }
                          }}
                          className="ml-2 w-16 rounded-md border border-slate-200 px-2 py-1 text-sm"
                        />
                      </label>
                      <button
                        type="button"
                        className="text-red-600"
                        disabled={removeMutation.isPending}
                        onClick={() => removeMutation.mutate(item.id)}
                        aria-label="Kaldır"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-medium">
                    {formatMoney(item.lineTotal)}
                  </p>
                </article>
              ))}
            </div>

            <aside className="h-fit rounded-lg border border-slate-200 bg-white p-4">
              <h2 className="text-sm font-semibold text-slate-800">Özet</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-600">Ara toplam</dt>
                  <dd>{formatMoney(cart.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600">KDV</dt>
                  <dd>{formatMoney(cart.taxTotal)}</dd>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2 font-semibold">
                  <dt>Toplam</dt>
                  <dd>{formatMoney(cart.grandTotal)}</dd>
                </div>
              </dl>
              <Link
                to="/odeme"
                className="theme-btn-primary mt-4 block rounded-md py-2 text-center text-sm"
              >
                Ödemeye geç
              </Link>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
