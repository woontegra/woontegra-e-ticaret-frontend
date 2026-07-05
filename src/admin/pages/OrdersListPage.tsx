import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, Eye } from 'lucide-react';
import type {
  OrderStatus,
  PaymentStatus,
  ShippingStatus,
} from '@/shared/types/api';
import {
  formatMoney,
  getOrder,
  listOrders,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  orderStatusBadgeVariant,
  SHIPPING_STATUS_LABELS,
} from '@/shared/api/orders.api';
import { OrderDetailPanel } from '@/admin/components/OrderDetailPanel';
import { AdminPanel } from '@/admin/components/AdminPanel';
import { TableQueryState } from '@/admin/components/TableQueryState';
import {
  Badge,
  Button,
  Drawer,
  Input,
  Label,
  Pagination,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/shared/ui';

const PAGE_SIZE = 20;

export function OrdersListPage() {
  const navigate = useNavigate();
  const [orderNumber, setOrderNumber] = useState('');
  const [customer, setCustomer] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | ''>('');
  const [shippingFilter, setShippingFilter] = useState<ShippingStatus | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [drawerOrderId, setDrawerOrderId] = useState<string | null>(null);

  const queryParams = useMemo(
    () => ({
      orderNumber: orderNumber || undefined,
      customer: customer || undefined,
      status: statusFilter || undefined,
      paymentStatus: paymentFilter || undefined,
      shippingStatus: shippingFilter || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      page,
      limit: PAGE_SIZE,
    }),
    [
      orderNumber,
      customer,
      statusFilter,
      paymentFilter,
      shippingFilter,
      dateFrom,
      dateTo,
      page,
    ],
  );

  const ordersQuery = useQuery({
    queryKey: ['admin', 'orders', queryParams],
    queryFn: () => listOrders(queryParams),
  });

  const drawerOrderQuery = useQuery({
    queryKey: ['admin', 'orders', drawerOrderId],
    queryFn: () => getOrder(drawerOrderId!),
    enabled: Boolean(drawerOrderId),
  });

  const total = ordersQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const items = ordersQuery.data?.items ?? [];

  const resetFilters = () => {
    setOrderNumber('');
    setCustomer('');
    setStatusFilter('');
    setPaymentFilter('');
    setShippingFilter('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  return (
    <>
      <AdminPanel
        filters={
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label htmlFor="filter-order-number">Sipariş no</Label>
              <Input
                id="filter-order-number"
                value={orderNumber}
                onChange={(event) => {
                  setOrderNumber(event.target.value);
                  setPage(1);
                }}
                placeholder="W20250705-1234"
              />
            </div>
            <div>
              <Label htmlFor="filter-customer">Müşteri / e-posta</Label>
              <Input
                id="filter-customer"
                value={customer}
                onChange={(event) => {
                  setCustomer(event.target.value);
                  setPage(1);
                }}
                placeholder="Ad veya e-posta"
              />
            </div>
            <div>
              <Label htmlFor="filter-status">Sipariş durumu</Label>
              <Select
                id="filter-status"
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value as OrderStatus | '');
                  setPage(1);
                }}
              >
                <option value="">Tümü</option>
                {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="filter-payment">Ödeme durumu</Label>
              <Select
                id="filter-payment"
                value={paymentFilter}
                onChange={(event) => {
                  setPaymentFilter(event.target.value as PaymentStatus | '');
                  setPage(1);
                }}
              >
                <option value="">Tümü</option>
                {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="filter-shipping">Kargo durumu</Label>
              <Select
                id="filter-shipping"
                value={shippingFilter}
                onChange={(event) => {
                  setShippingFilter(event.target.value as ShippingStatus | '');
                  setPage(1);
                }}
              >
                <option value="">Tümü</option>
                {Object.entries(SHIPPING_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="filter-date-from">Başlangıç tarihi</Label>
              <Input
                id="filter-date-from"
                type="date"
                value={dateFrom}
                onChange={(event) => {
                  setDateFrom(event.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div>
              <Label htmlFor="filter-date-to">Bitiş tarihi</Label>
              <Input
                id="filter-date-to"
                type="date"
                value={dateTo}
                onChange={(event) => {
                  setDateTo(event.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="flex items-end">
              <Button variant="secondary" size="sm" onClick={resetFilters}>
                Filtreleri temizle
              </Button>
            </div>
          </div>
        }
        footer={
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        }
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Sipariş no</TableHeaderCell>
              <TableHeaderCell>Müşteri</TableHeaderCell>
              <TableHeaderCell>Durum</TableHeaderCell>
              <TableHeaderCell>Ödeme</TableHeaderCell>
              <TableHeaderCell>Kargo</TableHeaderCell>
              <TableHeaderCell>Tutar</TableHeaderCell>
              <TableHeaderCell>Tarih</TableHeaderCell>
              <TableHeaderCell className="text-right">İşlem</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableQueryState
              colSpan={8}
              isLoading={ordersQuery.isLoading}
              isError={ordersQuery.isError}
              isEmpty={items.length === 0}
              emptyMessage="Filtrelere uygun sipariş yok."
            >
              {items.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>
                    <div>
                      <p>{order.customerName}</p>
                      <p className="text-xs text-slate-500">{order.customerEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={orderStatusBadgeVariant(order.status)}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">
                      {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {order.shippingStatus ? (
                      <Badge variant="default">
                        {SHIPPING_STATUS_LABELS[order.shippingStatus]}
                      </Badge>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>{formatMoney(order.grandTotal)}</TableCell>
                  <TableCell className="whitespace-nowrap text-slate-500">
                    {new Date(order.createdAt).toLocaleString('tr-TR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Hızlı görünüm"
                        onClick={() => setDrawerOrderId(order.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Tam sayfa"
                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableQueryState>
          </TableBody>
        </Table>
      </AdminPanel>

      <Drawer
        isOpen={Boolean(drawerOrderId)}
        onClose={() => setDrawerOrderId(null)}
        title={
          drawerOrderQuery.data
            ? `Sipariş ${drawerOrderQuery.data.orderNumber}`
            : 'Sipariş detayı'
        }
        size="xl"
      >
        {drawerOrderQuery.isPending ? (
          <p className="text-sm text-slate-500">Yükleniyor…</p>
        ) : drawerOrderQuery.data ? (
          <>
            <OrderDetailPanel order={drawerOrderQuery.data} />
            <div className="mt-4 border-t border-slate-100 pt-3">
              <Link
                to={`/admin/orders/${drawerOrderQuery.data.id}`}
                className="text-sm text-slate-600 hover:underline"
                onClick={() => setDrawerOrderId(null)}
              >
                Tam sayfada aç →
              </Link>
            </div>
          </>
        ) : (
          <p className="text-sm text-red-600">Sipariş yüklenemedi.</p>
        )}
      </Drawer>
    </>
  );
}
