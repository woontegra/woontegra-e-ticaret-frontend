import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { PaymentMethodPublicDto, StorefrontUiLabels } from '@/shared/types/api';
import { checkout, formatMoney } from '@/shared/api/cart.api';
import { ApiError } from '@/shared/api/client';
import {
  listPublicPaymentMethods,
  PAYMENT_METHOD_TYPE_LABELS,
} from '@/shared/api/payment.api';
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
import { uiLabel, uiLabelFormat } from '@/shared/lib/storefront-ui';
import { useStorefrontUi } from '@/storefront/hooks/useStorefrontUi';
import { Button, Input, Label, Textarea } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';

function getMethodHint(
  method: PaymentMethodPublicDto,
  ui: StorefrontUiLabels,
): string | null {
  if (method.type === 'BANK_TRANSFER') {
    const config = method.config as { accounts?: unknown[]; instructions?: string | null };
    if (config.accounts?.length) {
      return (
        uiLabelFormat(ui, 'checkoutBankAccountCount', {
          count: config.accounts.length,
        }) ?? null
      );
    }
  }
  if (method.type === 'CASH_ON_DELIVERY') {
    const config = method.config as { description?: string | null };
    if (config.description) return config.description;
  }
  if (method.type === 'EXTERNAL_LINK') {
    const config = method.config as { instructions?: string | null };
    if (config.instructions) return config.instructions;
  }
  if (method.isTestMode && (method.type === 'PAYTR' || method.type === 'IYZICO')) {
    return uiLabel(ui, 'checkoutTestMode') ?? null;
  }
  return null;
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const siteQuery = usePublicSiteSettings();
  const { seoSettings } = usePageSeo();
  const cmsQuery = useOptionalPublicPage('odeme');
  const cmsPage = cmsQuery.data;
  const ui = useStorefrontUi();
  const cartEmpty = uiLabel(ui, 'cartEmpty');
  const cartBackLink = uiLabel(ui, 'cartBackLink');
  const { cart, isLoading, invalidate, applyCouponMutation, removeCouponMutation } =
    useCart();
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    note: '',
    paymentMethodId: '',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const paymentMethodsQuery = useQuery({
    queryKey: ['public', 'payment-methods'],
    queryFn: listPublicPaymentMethods,
  });

  const activeMethods = paymentMethodsQuery.data ?? [];

  useEffect(() => {
    if (!form.paymentMethodId && activeMethods.length === 1) {
      setForm((prev) => ({
        ...prev,
        paymentMethodId: activeMethods[0]!.id,
      }));
    }
  }, [activeMethods, form.paymentMethodId]);

  const selectedMethod = useMemo(
    () => activeMethods.find((m) => m.id === form.paymentMethodId),
    [activeMethods, form.paymentMethodId],
  );

  const checkoutMutation = useMutation({
    mutationFn: () =>
      checkout({
        customerName: form.customerName.trim(),
        customerEmail: form.customerEmail.trim(),
        customerPhone: form.customerPhone.trim(),
        note: form.note.trim() || null,
        paymentMethodId: form.paymentMethodId,
      }),
    onSuccess: (result) => {
      invalidate();
      const redirectUrl = result.payment.redirectUrl?.trim();
      if (redirectUrl) {
        window.location.assign(redirectUrl);
        return;
      }
      navigate(`/siparis-basarili/${result.order.orderNumber}`, {
        replace: true,
        state: result,
      });
    },
    onError: (error) => {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : uiLabel(ui, 'checkoutErrorGeneric') ?? null,
      );
    },
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.paymentMethodId) {
      setErrorMessage(uiLabel(ui, 'checkoutPaymentRequired') ?? null);
      return;
    }
    checkoutMutation.mutate();
  };

  if (isLoading || paymentMethodsQuery.isLoading) {
    return (
      <div className="mx-auto max-w-3xl animate-pulse space-y-4">
        <div className="h-8 w-1/3 rounded bg-slate-100" />
        <div className="h-48 rounded bg-slate-100" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    if (!cartEmpty && !cartBackLink) {
      return null;
    }

    return (
      <div className="mx-auto max-w-3xl py-16 text-center">
        {cartEmpty ? (
          <p className="text-sm text-theme-muted">{cartEmpty}</p>
        ) : null}
        {cartBackLink ? (
          <Link to="/" className="theme-link mt-4 inline-block text-sm">
            {cartBackLink}
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
        robotsIndex={cmsPage?.robotsIndex ?? true}
      />

      <div className="mx-auto max-w-4xl">
        <StorefrontPageHeading
          cmsPage={cmsPage}
          seoSettings={seoSettings}
          siteSettings={siteQuery.data}
        />

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <section className="space-y-4">
              {uiLabel(ui, 'checkoutContactTitle') ? (
                <h2 className="text-sm font-semibold text-slate-800">
                  {uiLabel(ui, 'checkoutContactTitle')}
                </h2>
              ) : null}
              {uiLabel(ui, 'checkoutNameLabel') ? (
              <div>
                <Label htmlFor="checkout-name">{uiLabel(ui, 'checkoutNameLabel')}</Label>
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
              ) : null}
              {uiLabel(ui, 'checkoutEmailLabel') ? (
              <div>
                <Label htmlFor="checkout-email">{uiLabel(ui, 'checkoutEmailLabel')}</Label>
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
              ) : null}
              {uiLabel(ui, 'checkoutPhoneLabel') ? (
              <div>
                <Label htmlFor="checkout-phone">{uiLabel(ui, 'checkoutPhoneLabel')}</Label>
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
              ) : null}
              {uiLabel(ui, 'checkoutNoteLabel') ? (
              <div>
                <Label htmlFor="checkout-note">{uiLabel(ui, 'checkoutNoteLabel')}</Label>
                <Textarea
                  id="checkout-note"
                  rows={3}
                  value={form.note}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, note: event.target.value }))
                  }
                />
              </div>
              ) : null}
            </section>

            <section className="space-y-3">
              {uiLabel(ui, 'checkoutPaymentTitle') ? (
                <h2 className="text-sm font-semibold text-slate-800">
                  {uiLabel(ui, 'checkoutPaymentTitle')}
                </h2>
              ) : null}

              {activeMethods.length === 0 && uiLabel(ui, 'checkoutNoPaymentMethods') ? (
                <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  {uiLabel(ui, 'checkoutNoPaymentMethods')}
                </p>
              ) : activeMethods.length === 0 ? null : (
                <div className="space-y-2">
                  {activeMethods.map((method) => {
                    const hint = getMethodHint(method, ui);
                    const selected = form.paymentMethodId === method.id;
                    return (
                      <label
                        key={method.id}
                        className={cn(
                          'flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors',
                          selected
                            ? 'border-slate-900 bg-slate-50'
                            : 'border-slate-200 hover:border-slate-300',
                        )}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          className="mt-1"
                          checked={selected}
                          onChange={() =>
                            setForm((prev) => ({
                              ...prev,
                              paymentMethodId: method.id,
                            }))
                          }
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block font-medium text-slate-900">
                            {method.name}
                          </span>
                          <span className="block text-xs text-slate-500">
                            {PAYMENT_METHOD_TYPE_LABELS[method.type]}
                            {method.isTestMode && uiLabel(ui, 'checkoutTestMode')
                              ? ` · ${uiLabel(ui, 'checkoutTestMode')}`
                              : ''}
                          </span>
                          {hint ? (
                            <span className="mt-1 block text-sm text-slate-600">
                              {hint}
                            </span>
                          ) : null}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}

              {selectedMethod?.type === 'BANK_TRANSFER' ? (
                (() => {
                  const config = selectedMethod.config as {
                    accounts?: Array<{
                      bankName: string;
                      accountHolder: string;
                      iban: string;
                      branch?: string | null;
                    }>;
                    instructions?: string | null;
                  };
                  if (!config.accounts?.length) return null;
                  return (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                  {uiLabel(ui, 'checkoutBankAccountsTitle') ? (
                    <p className="font-medium text-slate-800">
                      {uiLabel(ui, 'checkoutBankAccountsTitle')}
                    </p>
                  ) : null}
                  <ul className="mt-2 space-y-2">
                    {config.accounts.map((account, index) => (
                      <li key={index}>
                        <span className="font-medium">{account.bankName}</span>
                        {' — '}
                        {account.accountHolder}
                        <br />
                        <span className="text-slate-600">{account.iban}</span>
                      </li>
                    ))}
                  </ul>
                  {config.instructions ? (
                    <p className="mt-2 text-slate-600">{config.instructions}</p>
                  ) : null}
                </div>
                  );
                })()
              ) : null}
            </section>

            {errorMessage ? (
              <p className="text-sm text-red-600">{errorMessage}</p>
            ) : null}

            <Button
              type="submit"
              disabled={
                checkoutMutation.isPending || activeMethods.length === 0
              }
            >
              {checkoutMutation.isPending
                ? uiLabel(ui, 'checkoutSubmitPending')
                : uiLabel(ui, 'checkoutSubmit')}
            </Button>
          </form>

          <aside className="h-fit rounded-lg border border-slate-200 bg-white p-4">
            {uiLabel(ui, 'checkoutOrderSummary') ? (
              <h2 className="text-sm font-semibold">{uiLabel(ui, 'checkoutOrderSummary')}</h2>
            ) : null}
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

            <div className="mt-4 border-t border-slate-100 pt-3">
              {uiLabel(ui, 'checkoutCouponLabel') ? (
                <Label htmlFor="checkout-coupon">{uiLabel(ui, 'checkoutCouponLabel')}</Label>
              ) : null}
              {cart.couponCode ? (
                <div className="mt-2 flex items-center justify-between rounded-md bg-emerald-50 px-3 py-2 text-sm">
                  <span className="font-medium text-emerald-800">
                    {cart.couponCode}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={removeCouponMutation.isPending}
                    onClick={() => {
                      removeCouponMutation.mutate(undefined, {
                        onSuccess: () => {
                          setCouponCode('');
                          setCouponMessage(null);
                        },
                      });
                    }}
                  >
                    {uiLabel(ui, 'checkoutCouponRemove')}
                  </Button>
                </div>
              ) : (
                <div className="mt-2 flex gap-2">
                  <Input
                    id="checkout-coupon"
                    value={couponCode}
                    placeholder={uiLabel(ui, 'checkoutCouponPlaceholder') ?? ''}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={
                      !couponCode.trim() || applyCouponMutation.isPending
                    }
                    onClick={() => {
                      setCouponMessage(null);
                      applyCouponMutation.mutate(couponCode.trim(), {
                        onSuccess: () => {
                          setCouponMessage(uiLabel(ui, 'checkoutCouponApplied') ?? null);
                          setCouponCode('');
                        },
                        onError: (error) => {
                          setCouponMessage(
                            error instanceof ApiError
                              ? error.message
                              : uiLabel(ui, 'checkoutCouponError') ?? null,
                          );
                        },
                      });
                    }}
                  >
                    {uiLabel(ui, 'checkoutCouponApply')}
                  </Button>
                </div>
              )}
              {couponMessage ? (
                <p className="mt-2 text-xs text-slate-600">{couponMessage}</p>
              ) : null}
            </div>

            <dl className="mt-4 space-y-1 border-t border-slate-100 pt-3 text-sm">
              {uiLabel(ui, 'checkoutSubtotal') ? (
              <div className="flex justify-between">
                <dt className="text-slate-600">{uiLabel(ui, 'checkoutSubtotal')}</dt>
                <dd>{formatMoney(cart.subtotal)}</dd>
              </div>
              ) : null}
              {uiLabel(ui, 'checkoutTax') ? (
              <div className="flex justify-between">
                <dt className="text-slate-600">{uiLabel(ui, 'checkoutTax')}</dt>
                <dd>{formatMoney(cart.taxTotal)}</dd>
              </div>
              ) : null}
              {cart.discountTotal > 0 && uiLabel(ui, 'checkoutDiscount') ? (
                <div className="flex justify-between text-emerald-700">
                  <dt>{uiLabel(ui, 'checkoutDiscount')}</dt>
                  <dd>-{formatMoney(cart.discountTotal)}</dd>
                </div>
              ) : null}
              {uiLabel(ui, 'checkoutTotal') ? (
              <div className="flex justify-between font-semibold">
                <dt>{uiLabel(ui, 'checkoutTotal')}</dt>
                <dd>{formatMoney(cart.grandTotal)}</dd>
              </div>
              ) : null}
            </dl>
          </aside>
        </div>
      </div>
    </>
  );
}
