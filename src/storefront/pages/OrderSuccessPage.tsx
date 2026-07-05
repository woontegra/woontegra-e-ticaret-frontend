import { Link, useLocation, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, CreditCard, ExternalLink, Truck } from 'lucide-react';
import {
  formatMoney,
  getPublicOrder,
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

export function OrderSuccessPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const location = useLocation();
  const siteQuery = usePublicSiteSettings();
  const { seoSettings } = usePageSeo();
  const cmsQuery = useOptionalPublicPage('siparis-basarili');
  const cmsPage = cmsQuery.data;
  const checkoutState = location.state as CheckoutResultDto | null;
  const stateOrder = checkoutState?.order;

  const orderQuery = useQuery({
    queryKey: ['public', 'orders', orderNumber],
    queryFn: () => getPublicOrder(orderNumber!),
    enabled: Boolean(orderNumber) && !stateOrder,
  });

  const order: PublicOrderDto | undefined = stateOrder ?? orderQuery.data;
  const payment = checkoutState?.payment;
  const shipment = order?.shipment;
  if (!order && orderQuery.isPending) {
    return (
      <div className="mx-auto max-w-2xl animate-pulse space-y-4 py-16">
        <div className="mx-auto h-12 w-12 rounded-full bg-slate-100" />
        <div className="h-6 w-1/2 rounded bg-slate-100" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-theme-muted">Sipariş bulunamadı.</p>
        <Link to="/" className="mt-4 inline-block text-sm hover:underline">
          Ana sayfaya dön
        </Link>
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
        <p className="mt-2 text-theme-muted">
          Sipariş numaranız:{' '}
          <span className="font-medium text-slate-900">{order.orderNumber}</span>
        </p>
        <p className="mt-1 text-sm text-theme-muted">
          {ORDER_STATUS_LABELS[order.status]} ·{' '}
          {PAYMENT_STATUS_LABELS[order.paymentStatus]}
          {order.paymentMethodName ? ` · ${order.paymentMethodName}` : ''}
        </p>

        {payment?.methodType === 'BANK_TRANSFER' &&
        payment.bankAccounts?.length ? (
          <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 text-left text-sm">
            <h2 className="flex items-center gap-2 font-semibold text-slate-800">
              <CreditCard className="h-4 w-4" />
              Havale / EFT bilgileri
            </h2>
            <p className="mt-2 text-slate-600">
              Lütfen aşağıdaki hesaplardan birine{' '}
              <strong>{formatMoney(order.grandTotal)}</strong> tutarında ödeme
              yapın. Açıklama alanına sipariş numaranızı yazın:{' '}
              <strong>{order.orderNumber}</strong>
            </p>
            <ul className="mt-3 space-y-3">
              {payment.bankAccounts.map((account, index) => (
                <li
                  key={index}
                  className="rounded-md border border-slate-100 bg-slate-50 p-3"
                >
                  <p className="font-medium">{account.bankName}</p>
                  <p className="text-slate-600">{account.accountHolder}</p>
                  <p className="mt-1 font-mono text-sm">{account.iban}</p>
                  {account.branch ? (
                    <p className="text-slate-500">Şube: {account.branch}</p>
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

        {shipment?.trackingUrl ? (          <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 text-left text-sm">
            <h2 className="flex items-center gap-2 font-semibold text-slate-800">
              <Truck className="h-4 w-4" />
              Kargo takibi
            </h2>
            {shipment.carrierName ? (
              <p className="mt-2 text-slate-600">{shipment.carrierName}</p>
            ) : null}
            {shipment.trackingNumber ? (
              <p className="mt-1 text-slate-600">
                Takip no:{' '}
                <span className="font-medium text-slate-900">
                  {shipment.trackingNumber}
                </span>
              </p>
            ) : null}
            <a
              href={shipment.trackingUrl}
              target="_blank"
              rel="noreferrer"
              className="theme-btn-primary mt-3 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm"
            >
              Kargoyu takip et
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ) : null}

        <div className="mt-8 rounded-lg border border-slate-200 bg-white p-4 text-left text-sm">
          <h2 className="font-semibold text-slate-800">Sipariş özeti</h2>
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

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to={`/siparis/takip/${order.orderNumber}`}
            className="inline-block rounded-md border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
          >
            Siparişi takip et
          </Link>
          <Link
            to="/urunler"
            className="theme-btn-primary inline-block rounded-md px-4 py-2 text-sm"
          >
            Alışverişe devam
          </Link>
          <Link to="/" className="inline-block text-sm hover:underline">
            Ana sayfa
          </Link>
        </div>
      </div>
    </>
  );
}
