import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { OrderDto, OrderStatus, PaymentStatus, ShippingStatus } from '@/shared/types/api';
import { ApiError } from '@/shared/api/client';
import {
  formatMoney,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  SHIPPING_STATUS_LABELS,
  orderStatusBadgeVariant,
  retryOrderDigitalDelivery,
  retryOrderItemLicense,
  retryOrderItemSaasProvision,
  updateOrderAdminNote,
  updateOrderPaymentStatus,
  updateOrderShipment,
  updateOrderShippingStatus,
  updateOrderStatus,
} from '@/shared/api/orders.api';
import { SAAS_PROVISION_STATUS_LABELS } from '@/shared/api/saas.api';
import {
  PAYMENT_METHOD_TYPE_LABELS,
  PAYMENT_TRANSACTION_STATUS_LABELS,
} from '@/shared/api/payment.api';
import { listActiveShippingCarriers } from '@/shared/api/shipping.api';
import {
  Badge,
  Button,
  Input,
  Label,
  Select,
  Textarea,
} from '@/shared/ui';

interface OrderDetailPanelProps {
  order: OrderDto;
  onUpdated?: (order: OrderDto) => void;
}

export function OrderDetailPanel({ order, onUpdated }: OrderDetailPanelProps) {
  const queryClient = useQueryClient();
  const [adminNote, setAdminNote] = useState(order.adminNote ?? '');
  const [carrierId, setCarrierId] = useState(order.shipment?.carrierId ?? '');
  const [trackingNumber, setTrackingNumber] = useState(
    order.shipment?.trackingNumber ?? '',
  );

  const carriersQuery = useQuery({
    queryKey: ['admin', 'shipping-carriers', 'active'],
    queryFn: listActiveShippingCarriers,
  });

  useEffect(() => {
    setAdminNote(order.adminNote ?? '');
  }, [order.adminNote, order.id]);

  useEffect(() => {
    setCarrierId(order.shipment?.carrierId ?? '');
    setTrackingNumber(order.shipment?.trackingNumber ?? '');
  }, [order.id, order.shipment?.carrierId, order.shipment?.trackingNumber]);

  const invalidate = (updated: OrderDto) => {
    queryClient.setQueryData(['admin', 'orders', order.id], updated);
    queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
    onUpdated?.(updated);
  };

  const statusMutation = useMutation({
    mutationFn: (status: OrderStatus) => updateOrderStatus(order.id, status),
    onSuccess: invalidate,
  });

  const paymentMutation = useMutation({
    mutationFn: (paymentStatus: PaymentStatus) =>
      updateOrderPaymentStatus(order.id, paymentStatus),
    onSuccess: invalidate,
  });

  const shippingMutation = useMutation({
    mutationFn: (shippingStatus: ShippingStatus | null) =>
      updateOrderShippingStatus(order.id, shippingStatus),
    onSuccess: invalidate,
  });

  const noteMutation = useMutation({
    mutationFn: () => updateOrderAdminNote(order.id, adminNote.trim() || null),
    onSuccess: invalidate,
  });

  const shipmentMutation = useMutation({
    mutationFn: () =>
      updateOrderShipment(order.id, {
        carrierId: carrierId || null,
        trackingNumber: trackingNumber.trim() || null,
        status:
          order.shippingStatus ??
          order.shipment?.status ??
          'PENDING',
      }),
    onSuccess: invalidate,
  });

  const digitalDeliveryMutation = useMutation({
    mutationFn: () => retryOrderDigitalDelivery(order.id),
    onSuccess: invalidate,
  });

  const licenseRetryMutation = useMutation({
    mutationFn: (orderItemId: string) =>
      retryOrderItemLicense(order.id, orderItemId),
    onSuccess: invalidate,
  });

  const saasRetryMutation = useMutation({
    mutationFn: (orderItemId: string) =>
      retryOrderItemSaasProvision(order.id, orderItemId),
    onSuccess: invalidate,
  });

  const isSaving =
    statusMutation.isPending ||
    paymentMutation.isPending ||
    shippingMutation.isPending ||
    noteMutation.isPending ||
    shipmentMutation.isPending ||
    digitalDeliveryMutation.isPending ||
    licenseRetryMutation.isPending ||
    saasRetryMutation.isPending;

  const mutationError =
    (statusMutation.error ??
      paymentMutation.error ??
      shippingMutation.error ??
      noteMutation.error ??
      shipmentMutation.error ??
          digitalDeliveryMutation.error ??
          licenseRetryMutation.error ??
          saasRetryMutation.error) instanceof ApiError
      ? (statusMutation.error ??
          paymentMutation.error ??
          shippingMutation.error ??
          noteMutation.error ??
          shipmentMutation.error ??
          digitalDeliveryMutation.error ??
          licenseRetryMutation.error as ApiError).message
      : null;

  const digitalDeliveryItems = order.digitalDelivery ?? [];
  const licenseDeliveryItems = order.licenseDelivery ?? [];
  const saasDeliveryItems = order.saasDelivery ?? [];
  const paymentTransactions = order.paymentTransactions ?? [];
  const [revealedPasswords, setRevealedPasswords] = useState<
    Record<string, boolean>
  >({});

  const DELIVERY_STATUS_LABELS: Record<string, string> = {
    PENDING: 'Bekliyor',
    READY: 'Hazır',
    SENT: 'Gönderildi',
    FAILED: 'Başarısız',
  };

  const LICENSE_STATUS_LABELS: Record<string, string> = {
    PENDING: 'Bekliyor',
    CREATED: 'Oluşturuldu',
    FAILED: 'Başarısız',
    SKIPPED: 'Atlandı',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={orderStatusBadgeVariant(order.status)}>
          {ORDER_STATUS_LABELS[order.status]}
        </Badge>
        <Badge variant="default">
          {PAYMENT_STATUS_LABELS[order.paymentStatus]}
        </Badge>
        {order.shippingStatus ? (
          <Badge variant="default">
            {SHIPPING_STATUS_LABELS[order.shippingStatus]}
          </Badge>
        ) : null}
      </div>

      <section>
        <h3 className="text-sm font-semibold text-slate-800">Durum yönetimi</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div>
            <Label>Sipariş durumu</Label>
            <Select
              value={order.status}
              disabled={isSaving}
              onChange={(event) =>
                statusMutation.mutate(event.target.value as OrderStatus)
              }
            >
              {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Ödeme durumu</Label>
            <Select
              value={order.paymentStatus}
              disabled={isSaving}
              onChange={(event) =>
                paymentMutation.mutate(event.target.value as PaymentStatus)
              }
            >
              {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            {order.paymentStatus === 'WAITING_BANK_TRANSFER' ? (
              <Button
                size="sm"
                className="mt-2"
                disabled={paymentMutation.isPending}
                onClick={() => paymentMutation.mutate('PAID')}
              >
                Ödemeyi Onayla
              </Button>
            ) : null}
          </div>
          <div>
            <Label>Kargo durumu</Label>
            <Select
              value={order.shippingStatus ?? ''}
              disabled={isSaving}
              onChange={(event) =>
                shippingMutation.mutate(
                  event.target.value
                    ? (event.target.value as ShippingStatus)
                    : null,
                )
              }
            >
              <option value="">Belirtilmedi</option>
              {Object.entries(SHIPPING_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-800">Ödeme bilgisi</h3>
        <dl className="mt-2 space-y-1 text-sm">
          <div>
            <dt className="text-slate-500">Yöntem</dt>
            <dd>
              {order.paymentMethodName ?? '—'}
              {order.paymentMethodType
                ? ` (${PAYMENT_METHOD_TYPE_LABELS[order.paymentMethodType] ?? order.paymentMethodType})`
                : ''}
            </dd>
          </div>
        </dl>
        {paymentTransactions.length > 0 ? (
          <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-slate-500">
                  <th className="px-3 py-2">Sağlayıcı</th>
                  <th className="px-3 py-2">Durum</th>
                  <th className="px-3 py-2">Tutar</th>
                  <th className="px-3 py-2">Referans</th>
                  <th className="px-3 py-2">Tarih</th>
                </tr>
              </thead>
              <tbody>
                {paymentTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-slate-50">
                    <td className="px-3 py-2">
                      {PAYMENT_METHOD_TYPE_LABELS[tx.provider] ?? tx.provider}
                    </td>
                    <td className="px-3 py-2">
                      {PAYMENT_TRANSACTION_STATUS_LABELS[tx.status] ?? tx.status}
                    </td>
                    <td className="px-3 py-2">{formatMoney(tx.amount)}</td>
                    <td className="px-3 py-2 font-mono text-xs">
                      {tx.providerReference ?? '—'}
                    </td>
                    <td className="px-3 py-2">
                      {new Date(tx.createdAt).toLocaleString('tr-TR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-500">Ödeme işlem kaydı yok.</p>
        )}
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-800">Kargo takibi</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Kargo firması</Label>
            <Select
              value={carrierId}
              disabled={isSaving}
              onChange={(event) => setCarrierId(event.target.value)}
            >
              <option value="">Seçin…</option>
              {(carriersQuery.data ?? []).map((carrier) => (
                <option key={carrier.id} value={carrier.id}>
                  {carrier.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Takip numarası</Label>
            <Input
              value={trackingNumber}
              disabled={isSaving}
              placeholder="Kargo takip no"
              onChange={(event) => setTrackingNumber(event.target.value)}
            />
          </div>
        </div>
        {order.shipment?.trackingUrl ? (
          <p className="mt-2 text-sm">
            <span className="text-slate-500">Takip linki: </span>
            <a
              href={order.shipment.trackingUrl}
              target="_blank"
              rel="noreferrer"
              className="text-slate-900 underline"
            >
              {order.shipment.trackingUrl}
            </a>
          </p>
        ) : null}
        <Button
          size="sm"
          className="mt-2"
          disabled={shipmentMutation.isPending}
          onClick={() => shipmentMutation.mutate()}
        >
          Kargo bilgisini kaydet
        </Button>
      </section>

      {digitalDeliveryItems.length > 0 ? (
        <section>
          <h3 className="text-sm font-semibold text-slate-800">
            Dijital teslimat
          </h3>
          {order.paymentStatus !== 'PAID' ? (
            <p className="mt-2 text-sm text-amber-700">
              Ödeme tamamlanmadan teslimat yapılmaz.
            </p>
          ) : null}
          <div className="mt-3 space-y-3">
            {digitalDeliveryItems.map((item) => (
              <div
                key={item.orderItemId}
                className="rounded-lg border border-slate-200 p-3 text-sm"
              >
                <p className="font-medium text-slate-900">{item.productName}</p>
                <p className="text-slate-500">Teslimat: {item.deliveryMode}</p>
                <p className="text-slate-600">
                  Durum:{' '}
                  {item.deliveryStatus
                    ? DELIVERY_STATUS_LABELS[item.deliveryStatus] ??
                      item.deliveryStatus
                    : '—'}
                </p>
                <p className="text-slate-600">
                  Token: {item.tokenCount > 0 ? 'Oluşturuldu' : 'Yok'}
                  {item.downloadTokenCreatedAt
                    ? ` (${new Date(item.downloadTokenCreatedAt).toLocaleString('tr-TR')})`
                    : ''}
                </p>
                <p className="text-slate-600">
                  E-posta:{' '}
                  {item.downloadEmailSentAt
                    ? `Gönderildi (${new Date(item.downloadEmailSentAt).toLocaleString('tr-TR')})`
                    : 'Henüz gönderilmedi'}
                </p>
                {item.deliveryError ? (
                  <p className="mt-1 text-red-600">{item.deliveryError}</p>
                ) : null}
              </div>
            ))}
          </div>
          <Button
            size="sm"
            className="mt-3"
            disabled={
              digitalDeliveryMutation.isPending ||
              order.paymentStatus !== 'PAID'
            }
            onClick={() => digitalDeliveryMutation.mutate()}
          >
            Dijital Teslimatı Yeniden Dene
          </Button>
        </section>
      ) : null}

      {licenseDeliveryItems.length > 0 ? (
        <section>
          <h3 className="text-sm font-semibold text-slate-800">
            Merkezi lisans
          </h3>
          {order.paymentStatus !== 'PAID' ? (
            <p className="mt-2 text-sm text-amber-700">
              Ödeme tamamlanmadan lisans oluşturulmaz.
            </p>
          ) : null}
          <div className="mt-3 space-y-3">
            {licenseDeliveryItems.map((item) => {
              const showPassword = revealedPasswords[item.orderItemId];

              return (
                <div
                  key={item.orderItemId}
                  className="rounded-lg border border-slate-200 p-3 text-sm"
                >
                  <p className="font-medium text-slate-900">{item.productName}</p>
                  <p className="text-slate-500">
                    Uygulama kodu: {item.licenseAppCode ?? '—'}
                  </p>
                  <p className="text-slate-600">
                    Durum:{' '}
                    {item.licenseServerStatus
                      ? LICENSE_STATUS_LABELS[item.licenseServerStatus] ??
                        item.licenseServerStatus
                      : '—'}
                  </p>
                  <p className="text-slate-600">
                    Birim: {item.licenseServerUnitsNotified}/{item.quantity}
                  </p>
                  {item.licenseServerLicenseKey ? (
                    <p className="mt-1 font-mono text-xs text-slate-800">
                      Lisans: {item.licenseServerLicenseKey}
                    </p>
                  ) : null}
                  {item.licenseServerActivationPassword ? (
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <p className="font-mono text-xs text-slate-800">
                        Aktivasyon:{' '}
                        {showPassword
                          ? item.licenseServerActivationPassword
                          : '••••••••'}
                      </p>
                      <Button
                        size="sm"
                        variant="secondary"
                        type="button"
                        onClick={() =>
                          setRevealedPasswords((prev) => ({
                            ...prev,
                            [item.orderItemId]: !prev[item.orderItemId],
                          }))
                        }
                      >
                        {showPassword ? 'Gizle' : 'Göster'}
                      </Button>
                    </div>
                  ) : null}
                  {item.licenseServerExpiresAt ? (
                    <p className="text-slate-600">
                      Bitiş:{' '}
                      {new Date(item.licenseServerExpiresAt).toLocaleDateString(
                        'tr-TR',
                      )}
                    </p>
                  ) : null}
                  {item.licenseServerLastError ? (
                    <p className="mt-1 text-red-600">
                      {item.licenseServerLastError}
                    </p>
                  ) : null}
                  {item.canRetry ? (
                    <Button
                      size="sm"
                      className="mt-2"
                      disabled={licenseRetryMutation.isPending}
                      onClick={() =>
                        licenseRetryMutation.mutate(item.orderItemId)
                      }
                    >
                      Lisans Oluşturmayı Yeniden Dene
                    </Button>
                  ) : null}
                  {item.licenseServerStatus === 'CREATED' ? (
                    <p className="mt-2 text-xs text-slate-500">
                      Lisans oluşturuldu; yeniden üretim desteklenmiyor.
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {saasDeliveryItems.length > 0 ? (
        <section>
          <h3 className="text-sm font-semibold text-slate-800">
            SaaS provisioning
          </h3>
          {order.paymentStatus !== 'PAID' ? (
            <p className="mt-2 text-sm text-amber-700">
              Ödeme tamamlanmadan SaaS hesabı oluşturulmaz.
            </p>
          ) : null}
          <div className="mt-3 space-y-3">
            {saasDeliveryItems.map((item) => {
              const showPassword = revealedPasswords[`saas-${item.orderItemId}`];

              return (
                <div
                  key={item.orderItemId}
                  className="rounded-lg border border-slate-200 p-3 text-sm"
                >
                  <p className="font-medium text-slate-900">{item.productName}</p>
                  <p className="text-slate-500">
                    Uygulama: {item.saasAppCode ?? '—'}
                    {item.saasPlanCode ? ` · Plan: ${item.saasPlanCode}` : ''}
                  </p>
                  <p className="text-slate-600">
                    Durum:{' '}
                    {item.saasProvisionStatus
                      ? SAAS_PROVISION_STATUS_LABELS[item.saasProvisionStatus] ??
                        item.saasProvisionStatus
                      : '—'}
                  </p>
                  {item.externalTenantId ? (
                    <p className="text-slate-600">
                      Tenant ID: {item.externalTenantId}
                    </p>
                  ) : null}
                  {item.externalTenantSlug ? (
                    <p className="text-slate-600">
                      Tenant slug: {item.externalTenantSlug}
                    </p>
                  ) : null}
                  {item.loginUrl ? (
                    <p className="text-slate-600">
                      Giriş URL:{' '}
                      <a
                        href={item.loginUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                      >
                        {item.loginUrl}
                      </a>
                    </p>
                  ) : null}
                  {item.loginEmail ? (
                    <p className="text-slate-600">E-posta: {item.loginEmail}</p>
                  ) : null}
                  {item.temporaryPassword ? (
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <p className="font-mono text-xs text-slate-800">
                        Geçici şifre:{' '}
                        {showPassword ? item.temporaryPassword : '••••••••'}
                      </p>
                      <Button
                        size="sm"
                        variant="secondary"
                        type="button"
                        onClick={() =>
                          setRevealedPasswords((prev) => ({
                            ...prev,
                            [`saas-${item.orderItemId}`]: !prev[`saas-${item.orderItemId}`],
                          }))
                        }
                      >
                        {showPassword ? 'Gizle' : 'Göster'}
                      </Button>
                    </div>
                  ) : null}
                  {item.externalLicenseKey ? (
                    <p className="mt-1 font-mono text-xs text-slate-800">
                      Lisans: {item.externalLicenseKey}
                    </p>
                  ) : null}
                  {item.startsAt || item.endsAt ? (
                    <p className="text-slate-600">
                      {item.startsAt
                        ? `Başlangıç: ${new Date(item.startsAt).toLocaleDateString('tr-TR')}`
                        : null}
                      {item.startsAt && item.endsAt ? ' · ' : null}
                      {item.endsAt
                        ? `Bitiş: ${new Date(item.endsAt).toLocaleDateString('tr-TR')}`
                        : null}
                    </p>
                  ) : null}
                  {item.saasProvisionLastError ? (
                    <p className="mt-1 text-red-600">
                      {item.saasProvisionLastError}
                    </p>
                  ) : null}
                  {item.canRetry ? (
                    <Button
                      size="sm"
                      className="mt-2"
                      disabled={saasRetryMutation.isPending}
                      onClick={() =>
                        saasRetryMutation.mutate(item.orderItemId)
                      }
                    >
                      SaaS Oluşturmayı Yeniden Dene
                    </Button>
                  ) : null}
                  {item.saasProvisionStatus === 'CREATED' ? (
                    <p className="mt-2 text-xs text-slate-500">
                      SaaS hesabı oluşturuldu; yeniden üretim desteklenmiyor.
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Müşteri</h3>
          <dl className="mt-2 space-y-1 text-sm">
            <div>
              <dt className="text-slate-500">Ad</dt>
              <dd>{order.customerName}</dd>
            </div>
            <div>
              <dt className="text-slate-500">E-posta</dt>
              <dd>
                <a
                  href={`mailto:${order.customerEmail}`}
                  className="text-slate-900 hover:underline"
                >
                  {order.customerEmail}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Telefon</dt>
              <dd>
                <a
                  href={`tel:${order.customerPhone}`}
                  className="text-slate-900 hover:underline"
                >
                  {order.customerPhone}
                </a>
              </dd>
            </div>
            {order.note ? (
              <div>
                <dt className="text-slate-500">Müşteri notu</dt>
                <dd className="whitespace-pre-wrap">{order.note}</dd>
              </div>
            ) : null}
          </dl>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-800">Tutarlar</h3>
          <dl className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Ara toplam</dt>
              <dd>{formatMoney(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">KDV</dt>
              <dd>{formatMoney(order.taxTotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Kargo</dt>
              <dd>{formatMoney(order.shippingTotal)}</dd>
            </div>
            {order.discountTotal > 0 ? (
              <div className="flex justify-between">
                <dt className="text-slate-500">İndirim</dt>
                <dd>-{formatMoney(order.discountTotal)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-slate-100 pt-1 font-semibold">
              <dt>Genel toplam</dt>
              <dd>{formatMoney(order.grandTotal)}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-800">Ürün kalemleri</h3>
        <div className="mt-2 overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-slate-500">
                <th className="px-3 py-2">Ürün</th>
                <th className="px-3 py-2">SKU</th>
                <th className="px-3 py-2">Adet</th>
                <th className="px-3 py-2">Birim</th>
                <th className="px-3 py-2">Toplam</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-slate-50">
                  <td className="px-3 py-2">{item.nameSnapshot}</td>
                  <td className="px-3 py-2 text-slate-500">
                    {item.skuSnapshot ?? '—'}
                  </td>
                  <td className="px-3 py-2">{item.quantity}</td>
                  <td className="px-3 py-2">{formatMoney(item.unitPrice)}</td>
                  <td className="px-3 py-2 font-medium">
                    {formatMoney(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-800">Admin notu</h3>
        <Textarea
          className="mt-2"
          rows={4}
          value={adminNote}
          onChange={(event) => setAdminNote(event.target.value)}
          placeholder="İç operasyon notları…"
        />
        <Button
          size="sm"
          className="mt-2"
          disabled={noteMutation.isPending}
          onClick={() => noteMutation.mutate()}
        >
          Notu kaydet
        </Button>
      </section>

      {mutationError ? (
        <p className="text-sm text-red-600">{mutationError}</p>
      ) : null}

      <p className="text-xs text-slate-400">
        Oluşturulma: {new Date(order.createdAt).toLocaleString('tr-TR')}
        {' · '}
        Güncelleme: {new Date(order.updatedAt).toLocaleString('tr-TR')}
      </p>
    </div>
  );
}
