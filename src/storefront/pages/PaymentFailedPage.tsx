import { Link, useParams } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { SeoHead } from '@/storefront/components/SeoHead';

export function PaymentFailedPage() {
  const { orderNumber } = useParams<{ orderNumber?: string }>();

  return (
    <>
      <SeoHead title="Ödeme Başarısız" robotsIndex={false} />

      <div className="mx-auto max-w-2xl text-center">
        <XCircle className="mx-auto h-12 w-12 text-red-600" />
        <h1 className="theme-heading mt-4 text-2xl">Ödeme başarısız oldu</h1>
        {orderNumber ? (
          <p className="mt-2 text-theme-muted">
            Sipariş no: <span className="font-medium text-slate-900">{orderNumber}</span>
          </p>
        ) : null}
        <p className="mt-4 text-sm text-slate-600">
          Ödemeniz tamamlanamadı. Kart bilgilerinizi kontrol ederek tekrar deneyebilir
          veya farklı bir ödeme yöntemi seçebilirsiniz.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/odeme"
            className="theme-btn-primary inline-block rounded-md px-4 py-2 text-sm"
          >
            Ödemeye dön
          </Link>
          <Link to="/" className="inline-block text-sm hover:underline">
            Ana sayfa
          </Link>
        </div>
      </div>
    </>
  );
}
