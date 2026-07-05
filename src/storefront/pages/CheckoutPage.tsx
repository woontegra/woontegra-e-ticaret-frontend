import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { checkout, formatMoney } from '@/shared/api/cart.api';
import { ApiError } from '@/shared/api/client';
import { useCart } from '@/storefront/hooks/useCart';
import { SeoHead } from '@/storefront/components/SeoHead';
import { usePublicSiteSettings } from '@/storefront/hooks/usePublicSettings';
import { Button, Input, Label, Textarea } from '@/shared/ui';

export function CheckoutPage() {
  const navigate = useNavigate();
  const siteQuery = usePublicSiteSettings();
  const { cart, isLoading, invalidate } = useCart();

  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    note: '',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const checkoutMutation = useMutation({
    mutationFn: () =>
      checkout({
        customerName: form.customerName.trim(),
        customerEmail: form.customerEmail.trim(),
        customerPhone: form.customerPhone.trim(),
        note: form.note.trim() || null,
      }),
    onSuccess: (order) => {
      invalidate();
      navigate(`/siparis/basarili/${order.orderNumber}`, {
        replace: true,
        state: { order },
      });
    },
    onError: (error) => {
      setErrorMessage(
        error instanceof ApiError ? error.message : 'Sipariş oluşturulamadı.',
      );
    },
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl animate-pulse space-y-4">
        <div className="h-8 w-1/3 rounded bg-slate-100" />
        <div className="h-48 rounded bg-slate-100" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl py-16 text-center">
        <p className="text-sm text-theme-muted">Sepetiniz boş.</p>
        <Link to="/urunler" className="mt-4 inline-block text-sm hover:underline">
          ← Alışverişe dön
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
            ? `Ödeme | ${siteQuery.data.siteName}`
            : 'Ödeme'
        }
      />

      <div className="mx-auto max-w-4xl">
        <h1 className="theme-heading text-2xl sm:text-3xl">Ödeme</h1>
        <p className="mt-2 text-sm text-theme-muted">
          Siparişiniz oluşturulacak. Ödeme ve kargo adımları ileride entegre
          edilecektir.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              checkoutMutation.mutate();
            }}
          >
            <div>
              <Label htmlFor="checkout-name">Ad Soyad</Label>
              <Input
                id="checkout-name"
                required
                value={form.customerName}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    customerName: event.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="checkout-email">E-posta</Label>
              <Input
                id="checkout-email"
                type="email"
                required
                value={form.customerEmail}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    customerEmail: event.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="checkout-phone">Telefon</Label>
              <Input
                id="checkout-phone"
                required
                value={form.customerPhone}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    customerPhone: event.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="checkout-note">Sipariş notu (opsiyonel)</Label>
              <Textarea
                id="checkout-note"
                rows={3}
                value={form.note}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, note: event.target.value }))
                }
              />
            </div>

            {errorMessage ? (
              <p className="text-sm text-red-600">{errorMessage}</p>
            ) : null}

            <Button type="submit" disabled={checkoutMutation.isPending}>
              {checkoutMutation.isPending
                ? 'Sipariş oluşturuluyor…'
                : 'Siparişi tamamla'}
            </Button>
          </form>

          <aside className="h-fit rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold">Sipariş özeti</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {cart.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-2">
                  <span className="text-slate-600">
                    {item.lineLabel} × {item.quantity}
                  </span>
                  <span>{formatMoney(item.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1 border-t border-slate-100 pt-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-600">Ara toplam</dt>
                <dd>{formatMoney(cart.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">KDV</dt>
                <dd>{formatMoney(cart.taxTotal)}</dd>
              </div>
              <div className="flex justify-between font-semibold">
                <dt>Toplam</dt>
                <dd>{formatMoney(cart.grandTotal)}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </>
  );
}
