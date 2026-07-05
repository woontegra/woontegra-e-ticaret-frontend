import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, PackageSearch, Truck } from 'lucide-react';
import {
  formatMoney,
  getPublicOrder,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  SHIPPING_STATUS_LABELS,
} from '@/shared/api/cart.api';
import { Button, Input, Label } from '@/shared/ui';
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

export function OrderTrackingPage() {
  const { orderNumber: routeOrderNumber } = useParams<{ orderNumber?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const siteQuery = usePublicSiteSettings();
  const { seoSettings } = usePageSeo();
  const cmsQuery = useOptionalPublicPage('siparis-takip');
  const cmsPage = cmsQuery.data;
  const [lookupNumber, setLookupNumber] = useState(routeOrderNumber ?? '');

  const orderQuery = useQuery({
    queryKey: ['public', 'orders', routeOrderNumber],
    queryFn: () => getPublicOrder(routeOrderNumber!),
    enabled: Boolean(routeOrderNumber),
    retry: false,
  });

  const handleLookup = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = lookupNumber.trim();
    if (trimmed) {
      navigate(`/siparis/takip/${encodeURIComponent(trimmed)}`);
    }
  };

  const order = orderQuery.data;
  const shipment = order?.shipment;

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
        robotsIndex={false}
      />

      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <PackageSearch className="mx-auto h-10 w-10 text-slate-400" />
          <StorefrontPageHeading
            cmsPage={cmsPage}
            seoSettings={seoSettings}
            siteSettings={siteQuery.data}
          />
        </div>

        <form
          onSubmit={handleLookup}
          className="mt-8 rounded-lg border border-slate-200 bg-white p-4"
        >
          <Label htmlFor="orderNumber">Sipariş numarası</Label>
          <div className="mt-2 flex gap-2">
            <Input
              id="orderNumber"
              value={lookupNumber}
              onChange={(event) => setLookupNumber(event.target.value)}
              placeholder="W20250705-1234"
            />
            <Button type="submit">Sorgula</Button>
          </div>
        </form>

        {routeOrderNumber && orderQuery.isPending ? (
          <div className="mt-8 animate-pulse space-y-3 rounded-lg border border-slate-200 bg-white p-4">
            <div className="h-4 w-1/3 rounded bg-slate-100" />
            <div className="h-4 w-2/3 rounded bg-slate-100" />
          </div>
        ) : null}

        {routeOrderNumber && orderQuery.isError ? (
          <div className="mt-8 rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            Sipariş bulunamadı. Numarayı kontrol edip tekrar deneyin.
          </div>
        ) : null}

        {order ? (
          <div className="mt-8 space-y-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
              <h2 className="font-semibold text-slate-800">
                Sipariş {order.orderNumber}
              </h2>
              <p className="mt-1 text-theme-muted">
                {ORDER_STATUS_LABELS[order.status]} ·{' '}
                {PAYMENT_STATUS_LABELS[order.paymentStatus]}
              </p>
              {(order.shippingStatus || shipment) && (
                <p className="mt-1 flex items-center gap-1.5 text-slate-700">
                  <Truck className="h-4 w-4" />
                  {SHIPPING_STATUS_LABELS[
                    shipment?.status ?? order.shippingStatus ?? 'PENDING'
                  ]}
                </p>
              )}
            </div>

            {shipment?.trackingNumber ? (
              <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
                <h3 className="font-semibold text-slate-800">Kargo bilgisi</h3>
                <dl className="mt-3 space-y-2">
                  {shipment.carrierName ? (
                    <div>
                      <dt className="text-slate-500">Kargo firması</dt>
                      <dd>{shipment.carrierName}</dd>
                    </div>
                  ) : null}
                  <div>
                    <dt className="text-slate-500">Takip numarası</dt>
                    <dd className="font-medium">{shipment.trackingNumber}</dd>
                  </div>
                </dl>
                {shipment.trackingUrl ? (
                  <a
                    href={shipment.trackingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="theme-btn-primary mt-4 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm"
                  >
                    Kargoyu takip et
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ) : null}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                Henüz kargo takip bilgisi girilmemiş.
              </div>
            )}

            <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
              <h3 className="font-semibold text-slate-800">Sipariş özeti</h3>
              <ul className="mt-3 space-y-2">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-2">
                    <span className="text-slate-600">
                      {item.nameSnapshot} × {item.quantity}
                    </span>
                    <span>{formatMoney(item.total)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 border-t border-slate-100 pt-3 font-semibold">
                Toplam: {formatMoney(order.grandTotal)}
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-8 text-center">
          <Link to="/" className="text-sm hover:underline">
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    </>
  );
}
