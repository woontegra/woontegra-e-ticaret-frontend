import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
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
import { uiLabel } from '@/shared/lib/storefront-ui';
import { useStorefrontUi } from '@/storefront/hooks/useStorefrontUi';

export function OrderTrackingPage() {
  const { orderNumber: routeOrderNumber } = useParams<{ orderNumber?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const siteQuery = usePublicSiteSettings();
  const { seoSettings } = usePageSeo();
  const cmsQuery = useOptionalPublicPage('siparis-takip');
  const cmsPage = cmsQuery.data;
  const ui = useStorefrontUi();
  const orderTrackingNotFound = uiLabel(ui, 'orderTrackingNotFound');
  const orderTrackingNoShipment = uiLabel(ui, 'orderTrackingNoShipment');
  const orderTrackingBackLink = uiLabel(ui, 'orderTrackingBackLink');
  const orderNumberLabel = uiLabel(ui, 'orderNumberLabel');
  const orderTrackingFormNumberLabel = uiLabel(ui, 'orderTrackingFormNumberLabel');
  const orderTrackingFormNumberPlaceholder = uiLabel(
    ui,
    'orderTrackingFormNumberPlaceholder',
  );
  const orderTrackingFormEmailLabel = uiLabel(ui, 'orderTrackingFormEmailLabel');
  const orderTrackingFormEmailPlaceholder = uiLabel(
    ui,
    'orderTrackingFormEmailPlaceholder',
  );
  const orderTrackingFormSubmit = uiLabel(ui, 'orderTrackingFormSubmit');
  const orderTrackingShipmentTitle = uiLabel(ui, 'orderTrackingShipmentTitle');
  const orderTrackingCarrierLabel = uiLabel(ui, 'orderTrackingCarrierLabel');
  const orderTrackingNumberFieldLabel = uiLabel(
    ui,
    'orderTrackingNumberFieldLabel',
  );
  const orderTrackShipment = uiLabel(ui, 'orderTrackShipment');
  const orderSummaryTitle = uiLabel(ui, 'orderSummaryTitle');
  const orderTotalLabel = uiLabel(ui, 'orderTotalLabel');
  const [searchParams] = useSearchParams();
  const [lookupNumber, setLookupNumber] = useState(routeOrderNumber ?? '');
  const [lookupEmail, setLookupEmail] = useState(searchParams.get('email') ?? '');
  const queryEmail = searchParams.get('email')?.trim() ?? '';

  const orderQuery = useQuery({
    queryKey: ['public', 'orders', routeOrderNumber, queryEmail],
    queryFn: () => getPublicOrder(routeOrderNumber!, queryEmail),
    enabled: Boolean(routeOrderNumber) && Boolean(queryEmail),
    retry: false,
  });

  const handleLookup = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = lookupNumber.trim();
    const email = lookupEmail.trim();
    if (trimmed && email) {
      navigate(
        `/siparis/takip/${encodeURIComponent(trimmed)}?email=${encodeURIComponent(email)}`,
      );
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

        {(orderTrackingFormNumberLabel ||
          orderTrackingFormEmailLabel ||
          orderTrackingFormSubmit) && (
          <form
            onSubmit={handleLookup}
            className="mt-8 rounded-lg border border-slate-200 bg-white p-4"
          >
            <div className="space-y-3">
              {orderTrackingFormNumberLabel ? (
                <div>
                  <Label htmlFor="orderNumber">{orderTrackingFormNumberLabel}</Label>
                  <Input
                    id="orderNumber"
                    className="mt-1"
                    value={lookupNumber}
                    onChange={(event) => setLookupNumber(event.target.value)}
                    placeholder={orderTrackingFormNumberPlaceholder ?? ''}
                    required
                  />
                </div>
              ) : null}
              {orderTrackingFormEmailLabel ? (
                <div>
                  <Label htmlFor="orderEmail">{orderTrackingFormEmailLabel}</Label>
                  <Input
                    id="orderEmail"
                    type="email"
                    className="mt-1"
                    value={lookupEmail}
                    onChange={(event) => setLookupEmail(event.target.value)}
                    placeholder={orderTrackingFormEmailPlaceholder ?? ''}
                    required
                  />
                </div>
              ) : null}
              {orderTrackingFormSubmit ? (
                <Button type="submit">{orderTrackingFormSubmit}</Button>
              ) : null}
            </div>
          </form>
        )}

        {routeOrderNumber && orderQuery.isPending ? (
          <div className="mt-8 animate-pulse space-y-3 rounded-lg border border-slate-200 bg-white p-4">
            <div className="h-4 w-1/3 rounded bg-slate-100" />
            <div className="h-4 w-2/3 rounded bg-slate-100" />
          </div>
        ) : null}

        {routeOrderNumber && orderQuery.isError ? (
          orderTrackingNotFound ? (
            <div className="mt-8 rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">
              {orderTrackingNotFound}
            </div>
          ) : null
        ) : null}

        {order ? (
          <div className="mt-8 space-y-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
              {orderNumberLabel ? (
                <h2 className="font-semibold text-slate-800">
                  {orderNumberLabel}{' '}
                  <span className="font-normal">{order.orderNumber}</span>
                </h2>
              ) : null}
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
                {orderTrackingShipmentTitle ? (
                  <h3 className="font-semibold text-slate-800">
                    {orderTrackingShipmentTitle}
                  </h3>
                ) : null}
                <dl className="mt-3 space-y-2">
                  {shipment.carrierName && orderTrackingCarrierLabel ? (
                    <div>
                      <dt className="text-slate-500">{orderTrackingCarrierLabel}</dt>
                      <dd>{shipment.carrierName}</dd>
                    </div>
                  ) : null}
                  {orderTrackingNumberFieldLabel ? (
                    <div>
                      <dt className="text-slate-500">
                        {orderTrackingNumberFieldLabel}
                      </dt>
                      <dd className="font-medium">{shipment.trackingNumber}</dd>
                    </div>
                  ) : null}
                </dl>
                {shipment.trackingUrl && orderTrackShipment ? (
                  <a
                    href={shipment.trackingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="theme-btn-primary mt-4 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm"
                  >
                    {orderTrackShipment}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ) : null}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                {orderTrackingNoShipment ? (
                  <p className="mt-2 text-theme-muted">{orderTrackingNoShipment}</p>
                ) : null}
              </div>
            )}

            {orderSummaryTitle || orderTotalLabel ? (
              <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
                {orderSummaryTitle ? (
                  <h3 className="font-semibold text-slate-800">{orderSummaryTitle}</h3>
                ) : null}
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
                {orderTotalLabel ? (
                  <p className="mt-4 border-t border-slate-100 pt-3 font-semibold">
                    {orderTotalLabel} {formatMoney(order.grandTotal)}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        {orderTrackingBackLink ? (
          <div className="mt-8 text-center">
            <Link to="/" className="text-sm hover:underline">
              {orderTrackingBackLink}
            </Link>
          </div>
        ) : null}
      </div>
    </>
  );
}
