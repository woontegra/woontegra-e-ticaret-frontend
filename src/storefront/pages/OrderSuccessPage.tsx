import { Link, useLocation, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2 } from 'lucide-react';
import {
  formatMoney,
  getPublicOrder,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from '@/shared/api/cart.api';
import type { OrderDto } from '@/shared/types/api';
import { SeoHead } from '@/storefront/components/SeoHead';
import { usePublicSiteSettings } from '@/storefront/hooks/usePublicSettings';

export function OrderSuccessPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const location = useLocation();
  const siteQuery = usePublicSiteSettings();
  const stateOrder = (location.state as { order?: OrderDto } | null)?.order;

  const orderQuery = useQuery({
    queryKey: ['public', 'orders', orderNumber],
    queryFn: () => getPublicOrder(orderNumber!),
    enabled: Boolean(orderNumber) && !stateOrder,
  });

  const order = stateOrder ?? orderQuery.data;

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
        title={
          siteQuery.data?.siteName
            ? `Sipariş alındı | ${siteQuery.data.siteName}`
            : 'Sipariş alındı'
        }
      />

      <div className="mx-auto max-w-2xl text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
        <h1 className="theme-heading mt-4 text-2xl sm:text-3xl">
          Siparişiniz alındı
        </h1>
        <p className="mt-2 text-theme-muted">
          Sipariş numaranız:{' '}
          <span className="font-medium text-slate-900">{order.orderNumber}</span>
        </p>
        <p className="mt-1 text-sm text-theme-muted">
          {ORDER_STATUS_LABELS[order.status]} ·{' '}
          {PAYMENT_STATUS_LABELS[order.paymentStatus]}
        </p>

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
