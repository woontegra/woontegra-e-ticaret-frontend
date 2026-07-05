import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ReportDateRangeFilter } from '@/admin/components/ReportDateRangeFilter';
import { SimpleBarChart, SimpleLineChart } from '@/admin/components/SimpleBarChart';
import {
  defaultReportDateRange,
  formatReportMoney,
  getLowStockProducts,
  getNewCustomers,
  getOrdersByStatus,
  getPaymentMethodSummary,
  getSalesByDay,
  getTopProducts,
} from '@/shared/api/reports.api';
import { ORDER_STATUS_LABELS } from '@/shared/api/orders.api';
import {
  Badge,
  Card,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/shared/ui';

const LEAD_TYPE_LABELS = {
  customer: 'Yeni müşteri',
  contact: 'İletişim',
  form: 'Form',
} as const;

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ReportsPage() {
  const defaults = useMemo(() => defaultReportDateRange(), []);
  const [dateFrom, setDateFrom] = useState(defaults.dateFrom);
  const [dateTo, setDateTo] = useState(defaults.dateTo);

  const dateParams = useMemo(
    () => ({ dateFrom, dateTo }),
    [dateFrom, dateTo],
  );

  const salesQuery = useQuery({
    queryKey: ['admin', 'reports', 'sales-by-day', dateParams],
    queryFn: () => getSalesByDay(dateParams),
  });

  const statusQuery = useQuery({
    queryKey: ['admin', 'reports', 'orders-by-status', dateParams],
    queryFn: () => getOrdersByStatus(dateParams),
  });

  const topProductsQuery = useQuery({
    queryKey: ['admin', 'reports', 'top-products', dateParams],
    queryFn: () => getTopProducts({ ...dateParams, limit: 10 }),
  });

  const lowStockQuery = useQuery({
    queryKey: ['admin', 'reports', 'low-stock-products'],
    queryFn: getLowStockProducts,
  });

  const newCustomersQuery = useQuery({
    queryKey: ['admin', 'reports', 'new-customers', dateParams],
    queryFn: () => getNewCustomers(dateParams),
  });

  const paymentQuery = useQuery({
    queryKey: ['admin', 'reports', 'payment-method-summary', dateParams],
    queryFn: () => getPaymentMethodSummary(dateParams),
  });

  const salesChartItems =
    salesQuery.data?.items.map((item) => ({
      label: new Date(item.date).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short',
      }),
      value: item.totalSales,
    })) ?? [];

  const statusChartItems =
    statusQuery.data?.items.map((item) => ({
      label: ORDER_STATUS_LABELS[item.status] ?? item.status,
      value: item.orderCount,
    })) ?? [];

  const paymentChartItems =
    paymentQuery.data?.items.map((item) => ({
      label: item.methodName,
      value: item.totalSales,
    })) ?? [];

  return (
    <div className="space-y-4">
      <Card padding="sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Raporlar</h2>
            <p className="text-xs text-slate-500">
              Satış, sipariş, stok ve müşteri analizleri
            </p>
          </div>
          <ReportDateRangeFilter
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
          />
        </div>
      </Card>

      <div className="grid gap-3 xl:grid-cols-2">
        <Card padding="sm">
          <CardHeader title="Günlük satış" description="Ciro trendi" />
          <SimpleLineChart
            items={salesChartItems}
            valueFormatter={formatReportMoney}
            emptyMessage={
              salesQuery.isLoading ? 'Yükleniyor…' : 'Bu dönemde satış yok'
            }
          />
        </Card>

        <Card padding="sm">
          <CardHeader title="Ödeme yöntemleri" description="Yönteme göre ciro" />
          <SimpleBarChart
            items={paymentChartItems}
            valueFormatter={formatReportMoney}
            emptyMessage={
              paymentQuery.isLoading ? 'Yükleniyor…' : 'Ödeme verisi yok'
            }
          />
        </Card>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <Card padding="sm">
          <CardHeader title="Sipariş durumları" />
          <SimpleBarChart
            items={statusChartItems}
            emptyMessage={
              statusQuery.isLoading ? 'Yükleniyor…' : 'Sipariş verisi yok'
            }
          />
        </Card>

        <Card padding="sm">
          <CardHeader
            title="En çok satan ürünler"
            description="Adet ve ciro"
          />
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Ürün</TableHeaderCell>
                <TableHeaderCell>Adet</TableHeaderCell>
                <TableHeaderCell className="text-right">Ciro</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topProductsQuery.isLoading ? (
                <TableEmpty colSpan={3} message="Yükleniyor…" />
              ) : topProductsQuery.data?.items.length ? (
                topProductsQuery.data.items.map((product) => (
                  <TableRow key={product.productId}>
                    <TableCell className="font-medium text-slate-900">
                      {product.slug ? (
                        <Link
                          to={`/admin/products/${product.productId}`}
                          className="hover:underline"
                        >
                          {product.name}
                        </Link>
                      ) : (
                        product.name
                      )}
                    </TableCell>
                    <TableCell>{product.quantitySold}</TableCell>
                    <TableCell className="text-right">
                      {formatReportMoney(product.revenue)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableEmpty colSpan={3} message="Satış verisi yok" />
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <Card padding="sm">
          <CardHeader
            title="Düşük stoklu ürünler"
            description="Anlık stok durumu"
          />
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Ürün</TableHeaderCell>
                <TableHeaderCell>Stok</TableHeaderCell>
                <TableHeaderCell>Eşik</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lowStockQuery.isLoading ? (
                <TableEmpty colSpan={3} message="Yükleniyor…" />
              ) : lowStockQuery.data?.items.length ? (
                lowStockQuery.data.items.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium text-slate-900">
                      <Link
                        to={`/admin/products/${product.id}`}
                        className="hover:underline"
                      >
                        {product.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="warning">{product.stockQuantity}</Badge>
                    </TableCell>
                    <TableCell>{product.lowStockThreshold}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableEmpty colSpan={3} message="Düşük stoklu ürün yok" />
              )}
            </TableBody>
          </Table>
        </Card>

        <Card padding="sm">
          <CardHeader
            title="Yeni müşteriler ve leadler"
            description="İlk sipariş, iletişim ve form kayıtları"
          />
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Tarih</TableHeaderCell>
                <TableHeaderCell>Tip</TableHeaderCell>
                <TableHeaderCell>Ad</TableHeaderCell>
                <TableHeaderCell>Detay</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {newCustomersQuery.isLoading ? (
                <TableEmpty colSpan={4} message="Yükleniyor…" />
              ) : newCustomersQuery.data?.items.length ? (
                newCustomersQuery.data.items.map((item) => (
                  <TableRow key={`${item.type}-${item.id}`}>
                    <TableCell className="whitespace-nowrap text-xs text-slate-500">
                      {formatDateTime(item.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge>{LEAD_TYPE_LABELS[item.type]}</Badge>
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">
                      {item.name}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-slate-600">
                      {item.email ? `${item.email} · ` : ''}
                      {item.detail}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableEmpty colSpan={4} message="Kayıt yok" />
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
