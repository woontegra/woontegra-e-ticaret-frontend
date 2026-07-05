import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { OrderDto, OrderStatus, PaymentStatus, ShippingStatus } from '@/shared/types/api';
import { ApiError } from '@/shared/api/client';
import {
  formatMoney,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  SHIPPING_STATUS_LABELS,
  orderStatusBadgeVariant,
  updateOrderAdminNote,
  updateOrderPaymentStatus,
  updateOrderShippingStatus,
  updateOrderStatus,
} from '@/shared/api/orders.api';
import {
  Badge,
  Button,
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

  useEffect(() => {
    setAdminNote(order.adminNote ?? '');
  }, [order.adminNote, order.id]);

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

  const isSaving =
    statusMutation.isPending ||
    paymentMutation.isPending ||
    shippingMutation.isPending ||
    noteMutation.isPending;

  const mutationError =
    (statusMutation.error ??
      paymentMutation.error ??
      shippingMutation.error ??
      noteMutation.error) instanceof ApiError
      ? (statusMutation.error ??
          paymentMutation.error ??
          shippingMutation.error ??
          noteMutation.error as ApiError).message
      : null;

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
