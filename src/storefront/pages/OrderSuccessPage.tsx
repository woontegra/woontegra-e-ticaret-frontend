import { useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, CreditCard, ExternalLink, Truck } from 'lucide-react';
import {
  formatMoney,
  getPublicOrder,
  getPublicOrderDownloads,
  getPublicOrderSaasMemberships,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from '@/shared/api/cart.api';
import type { CheckoutResultDto, PublicOrderDto } from '@/shared/types/api';
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

export function OrderSuccessPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const location = useLocation();
  const siteQuery = usePublicSiteSettings();
  const { seoSettings } = usePageSeo();
  const cmsQuery = useOptionalPublicPage('siparis-basarili');
  const cmsPage = cmsQuery.data;
  const ui = useStorefrontUi();
  const orderNotFound = uiLabel(ui, 'orderNotFound');
  const orderSuccessHomeLink = uiLabel(ui, 'orderSuccessHomeLink');
  const orderNumberLabel = uiLabel(ui, 'orderNumberLabel');
  const orderBankTransferTitle = uiLabel(ui, 'orderBankTransferTitle');
  const orderBankTransferHint = uiLabel(ui, 'orderBankTransferHint');
  const orderBranchLabel = uiLabel(ui, 'orderBranchLabel');
  const orderTrackingTitle = uiLabel(ui, 'orderTrackingTitle');
  const orderTrackingNumberLabel = uiLabel(ui, 'orderTrackingNumberLabel');
  const orderTrackShipment = uiLabel(ui, 'orderTrackShipment');
  const orderSummaryTitle = uiLabel(ui, 'orderSummaryTitle');
  const orderTotalLabel = uiLabel(ui, 'orderTotalLabel');
  const orderTrackLink = uiLabel(ui, 'orderTrackLink');
  const orderContinueShopping = uiLabel(ui, 'orderContinueShopping');
  const checkoutState = location.state as CheckoutResultDto | null;
  const stateOrder = checkoutState?.order;

  useEffect(() => {
    if (stateOrder?.customerEmail && orderNumber) {
      sessionStorage.setItem(
        `order-email:${orderNumber}`,
        stateOrder.customerEmail,
      );
    }
  }, [stateOrder, orderNumber]);

  const storedEmail =
    orderNumber && typeof window !== 'undefined'
      ? sessionStorage.getItem(`order-email:${orderNumber}`)
      : null;
  const lookupEmail = stateOrder?.customerEmail ?? storedEmail ?? '';

  const orderQuery = useQuery({
    queryKey: ['public', 'orders', orderNumber, lookupEmail],
    queryFn: () => getPublicOrder(orderNumber!, lookupEmail),
    enabled: Boolean(orderNumber) && Boolean(lookupEmail) && !stateOrder,
    retry: false,
  });

  const order: PublicOrderDto | undefined = stateOrder ?? orderQuery.data;
  const payment = checkoutState?.payment;
  const shipment = order?.shipment;
  const fulfillmentMessages =
    checkoutState?.fulfillment?.messages ?? order?.fulfillment?.messages ?? [];

  const downloadsQuery = useQuery({
    queryKey: ['public', 'orders', orderNumber, lookupEmail, 'downloads'],
    queryFn: () => getPublicOrderDownloads(orderNumber!, lookupEmail),
    enabled:
      Boolean(orderNumber) &&
      Boolean(lookupEmail) &&
      order?.paymentStatus === 'PAID',
    retry: false,
  });

  const downloadLinks =
    order?.fulfillment?.downloadLinks ?? downloadsQuery.data?.links ?? [];

  const saasMembershipsQuery = useQuery({
    queryKey: ['public', 'orders', orderNumber, lookupEmail, 'saas'],
    queryFn: () => getPublicOrderSaasMemberships(orderNumber!, lookupEmail),
    enabled:
      Boolean(orderNumber) &&
      Boolean(lookupEmail) &&
      order?.paymentStatus === 'PAID',
    retry: false,
  });

  const saasMemberships =
    order?.fulfillment?.saasMemberships ??
    saasMembershipsQuery.data?.memberships ??
    [];
  const hasSaasProducts =
    saasMemberships.length > 0 ||
    (order?.fulfillment?.deliveryModes ?? []).includes('SAAS');
  if (!order && orderQuery.isPending) {
    return (
      <div className="mx-auto max-w-2xl animate-pulse space-y-4 py-16">
        <div className="mx-auto h-12 w-12 rounded-full bg-slate-100" />
        <div className="h-6 w-1/2 rounded bg-slate-100" />
      </div>
    );
  }

  if (!order) {
    if (!orderNotFound && !orderSuccessHomeLink) {
      return null;
    }

    return (
      <div className="py-16 text-center">
        {orderNotFound ? (
          <p className="text-sm text-theme-muted">{orderNotFound}</p>
        ) : null}
        {orderSuccessHomeLink ? (
          <Link to="/" className="mt-4 inline-block text-sm hover:underline">
            {orderSuccessHomeLink}
          </Link>
        ) : null}
      </div>
    );
  }

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

      <div className="mx-auto max-w-2xl text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
        <StorefrontPageHeading
          cmsPage={cmsPage}
          seoSettings={seoSettings}
          siteSettings={siteQuery.data}
        />
        {orderNumberLabel ? (
          <p className="mt-2 text-theme-muted">
            {orderNumberLabel}{' '}
            <span className="font-medium text-slate-900">{order.orderNumber}</span>
          </p>
        ) : null}
        <p className="mt-1 text-sm text-theme-muted">
          {ORDER_STATUS_LABELS[order.status]} ·{' '}
          {PAYMENT_STATUS_LABELS[order.paymentStatus]}
          {order.paymentMethodName ? ` · ${order.paymentMethodName}` : ''}
        </p>

        {payment?.methodType === 'BANK_TRANSFER' &&
        payment.bankAccounts?.length &&
        (orderBankTransferTitle || orderBankTransferHint) ? (
          <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 text-left text-sm">
            {orderBankTransferTitle ? (
              <h2 className="flex items-center gap-2 font-semibold text-slate-800">
                <CreditCard className="h-4 w-4" />
                {orderBankTransferTitle}
              </h2>
            ) : null}
            {orderBankTransferHint ? (
              <p className="mt-2 text-slate-600">{orderBankTransferHint}</p>
            ) : null}
            <ul className="mt-3 space-y-3">
              {payment.bankAccounts.map((account, index) => (
                <li
                  key={index}
                  className="rounded-md border border-slate-100 bg-slate-50 p-3"
                >
                  <p className="font-medium">{account.bankName}</p>
                  <p className="text-slate-600">{account.accountHolder}</p>
                  <p className="mt-1 font-mono text-sm">{account.iban}</p>
                  {account.branch && orderBranchLabel ? (
                    <p className="text-slate-500">
                      {orderBranchLabel} {account.branch}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
            {payment.instructions ? (
              <p className="mt-3 text-slate-600">{payment.instructions}</p>
            ) : null}
          </div>
        ) : null}

        {payment?.description ? (
          <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 text-left text-sm">
            <p className="text-slate-600">{payment.description}</p>
          </div>
        ) : null}

        {payment?.message ? (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-900">
            {payment.message}
          </div>
        ) : null}

        {fulfillmentMessages.length > 0 ? (
          <div className="mt-6 space-y-2 rounded-lg border border-slate-200 bg-white p-4 text-left text-sm text-slate-700">
            {fulfillmentMessages.map((message) => (
              <p key={message}>{message}</p>
            ))}
          </div>
        ) : null}

        {order.paymentStatus === 'FAILED' ? (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-left text-sm text-red-900">
            Ödeme başarısız oldu. Tekrar denemek için{' '}
            <Link to="/odeme" className="font-medium underline">
              ödeme sayfasına
            </Link>{' '}
            dönebilirsiniz.
          </div>
        ) : null}

        {hasSaasProducts && order.paymentStatus === 'WAITING_BANK_TRANSFER' ? (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-900">
            Ödemeniz onaylandıktan sonra SaaS hesabınız oluşturulacaktır.
          </div>
        ) : null}

        {hasSaasProducts &&
        order.paymentStatus === 'PAID' &&
        saasMemberships.length > 0 ? (
          <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 text-left text-sm">
            <h2 className="font-semibold text-slate-800">SaaS hesabınız</h2>
            <p className="mt-2 text-slate-600">
              Giriş bilgileriniz e-posta adresinize gönderildi.
            </p>
            <ul className="mt-3 space-y-3">
              {saasMemberships.map((membership, index) => (
                <li
                  key={`${membership.productName}-${index}`}
                  className="rounded-md border border-slate-100 bg-slate-50 p-3"
                >
                  <p className="font-medium text-slate-900">
                    {membership.productName}
                  </p>
                  {membership.loginUrl ? (
                    <a
                      href={membership.loginUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-sm font-medium text-slate-900 underline"
                    >
                      SaaS uygulamasına giriş yap
                    </a>
                  ) : null}
                  {membership.loginEmail ? (
                    <p className="mt-1 text-slate-600">
                      Giriş e-postası: {membership.loginEmail}
                    </p>
                  ) : null}
                  {membership.startsAt || membership.endsAt ? (
                    <p className="mt-1 text-xs text-slate-500">
                      {membership.startsAt
                        ? `Başlangıç: ${new Date(membership.startsAt).toLocaleDateString('tr-TR')}`
                        : null}
                      {membership.startsAt && membership.endsAt ? ' · ' : null}
                      {membership.endsAt
                        ? `Bitiş: ${new Date(membership.endsAt).toLocaleDateString('tr-TR')}`
                        : null}
                    </p>
                  ) : null}
                  {membership.note ? (
                    <p className="mt-1 text-slate-600">{membership.note}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {order.paymentStatus === 'PAID' && downloadLinks.length > 0 ? (
          <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 text-left text-sm">
            <h2 className="font-semibold text-slate-800">İndirme bağlantıları</h2>
            <ul className="mt-3 space-y-3">
              {downloadLinks.map((link, index) => (
                <li
                  key={`${link.productName}-${link.fileType ?? index}`}
                  className="rounded-md border border-slate-100 bg-slate-50 p-3"
                >
                  <p className="font-medium text-slate-900">{link.productName}</p>
                  <p className="text-slate-600">{link.label}</p>
                  {link.downloadUrl ? (
                    <a
                      href={link.downloadUrl}
                      className="mt-2 inline-block text-sm font-medium text-slate-900 underline"
                    >
                      Dosyayı indir
                    </a>
                  ) : (
                    <p className="mt-2 text-slate-600">
                      {link.note ??
                        'İndirme bağlantısı e-posta adresinize gönderildi.'}
                    </p>
                  )}
                  {link.expiresAt ? (
                    <p className="mt-1 text-xs text-slate-500">
                      Geçerlilik:{' '}
                      {new Date(link.expiresAt).toLocaleDateString('tr-TR')}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {shipment?.trackingUrl &&
        (orderTrackingTitle ||
          orderTrackingNumberLabel ||
          orderTrackShipment) ? (
          <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 text-left text-sm">
            {orderTrackingTitle ? (
              <h2 className="flex items-center gap-2 font-semibold text-slate-800">
                <Truck className="h-4 w-4" />
                {orderTrackingTitle}
              </h2>
            ) : null}
            {shipment.carrierName ? (
              <p className="mt-2 text-slate-600">{shipment.carrierName}</p>
            ) : null}
            {shipment.trackingNumber && orderTrackingNumberLabel ? (
              <p className="mt-1 text-slate-600">
                {orderTrackingNumberLabel}{' '}
                <span className="font-medium text-slate-900">
                  {shipment.trackingNumber}
                </span>
              </p>
            ) : null}
            {orderTrackShipment ? (
              <a
                href={shipment.trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="theme-btn-primary mt-3 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm"
              >
                {orderTrackShipment}
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        ) : null}

        {orderSummaryTitle || orderTotalLabel ? (
          <div className="mt-8 rounded-lg border border-slate-200 bg-white p-4 text-left text-sm">
            {orderSummaryTitle ? (
              <h2 className="font-semibold text-slate-800">{orderSummaryTitle}</h2>
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

        {orderTrackLink || orderContinueShopping || orderSuccessHomeLink ? (
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {orderTrackLink ? (
              <Link
                to={`/siparis/takip/${order.orderNumber}?email=${encodeURIComponent(order.customerEmail)}`}
                className="inline-block rounded-md border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
              >
                {orderTrackLink}
              </Link>
            ) : null}
            {orderContinueShopping ? (
              <Link
                to="/urunler"
                className="theme-btn-primary inline-block rounded-md px-4 py-2 text-sm"
              >
                {orderContinueShopping}
              </Link>
            ) : null}
            {orderSuccessHomeLink ? (
              <Link to="/" className="inline-block text-sm hover:underline">
                {orderSuccessHomeLink}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </>
  );
}
