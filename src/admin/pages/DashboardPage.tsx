import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  Mail,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import { MetricCard } from '@/admin/components/MetricCard';
import { ReportDateRangeFilter } from '@/admin/components/ReportDateRangeFilter';
import { SimpleBarChart, SimpleLineChart } from '@/admin/components/SimpleBarChart';
import {
  defaultReportDateRange,
  formatReportMoney,
  getDashboardSummary,
  getOrdersByStatus,
  getSalesByDay,
} from '@/shared/api/reports.api';
import {
  formatMoney,
  ORDER_STATUS_LABELS,
  orderStatusBadgeVariant,
} from '@/shared/api/orders.api';
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

export function DashboardPage() {
  const defaults = useMemo(() => defaultReportDateRange(), []);
  const [dateFrom, setDateFrom] = useState(defaults.dateFrom);
  const [dateTo, setDateTo] = useState(defaults.dateTo);

  const dateParams = useMemo(
    () => ({ dateFrom, dateTo }),
    [dateFrom, dateTo],
  );

  const summaryQuery = useQuery({
    queryKey: ['admin', 'dashboard', 'summary', dateParams],
    queryFn: () => getDashboardSummary(dateParams),
  });

  const salesQuery = useQuery({
    queryKey: ['admin', 'reports', 'sales-by-day', dateParams],
    queryFn: () => getSalesByDay(dateParams),
  });

  const statusQuery = useQuery({
    queryKey: ['admin', 'reports', 'orders-by-status', dateParams],
    queryFn: () => getOrdersByStatus(dateParams),
  });

  const summary = summaryQuery.data;

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

  return (
    <div className="space-y-4">
      <Card padding="sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Site özeti</h2>
            <p className="text-xs text-slate-500">
              Seçili dönemdeki satış ve operasyon metrikleri
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

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Toplam satış"
          value={
            summaryQuery.isLoading
              ? '…'
              : formatReportMoney(summary?.totalSales ?? 0)
          }
          icon={TrendingUp}
        />
        <MetricCard
          label="Sipariş sayısı"
          value={summaryQuery.isLoading ? '…' : String(summary?.orderCount ?? 0)}
          icon={ShoppingCart}
        />
        <MetricCard
          label="Ortalama sepet"
          value={
            summaryQuery.isLoading
              ? '…'
              : formatReportMoney(summary?.averageBasket ?? 0)
          }
          icon={Wallet}
        />
        <MetricCard
          label="Yeni müşteri / lead"
          value={
            summaryQuery.isLoading
              ? '…'
              : String((summary?.newCustomers ?? 0) + (summary?.newLeads ?? 0))
          }
          hint={`${summary?.newCustomers ?? 0} müşteri · ${summary?.newLeads ?? 0} lead`}
          icon={Users}
        />
        <MetricCard
          label="Bekleyen sipariş"
          value={summaryQuery.isLoading ? '…' : String(summary?.pendingOrders ?? 0)}
          icon={Package}
        />
        <MetricCard
          label="Düşük stok"
          value={summaryQuery.isLoading ? '…' : String(summary?.lowStockCount ?? 0)}
          icon={AlertTriangle}
        />
        <MetricCard
          label="Yeni iletişim mesajı"
          value={
            summaryQuery.isLoading ? '…' : String(summary?.newContactMessages ?? 0)
          }
          icon={Mail}
        />
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <Card padding="sm">
          <CardHeader title="Günlük satış" description="Seçili dönem trendi" />
          <SimpleLineChart
            items={salesChartItems}
            valueFormatter={formatReportMoney}
            emptyMessage={
              salesQuery.isLoading ? 'Yükleniyor…' : 'Bu dönemde satış yok'
            }
          />
        </Card>

        <Card padding="sm">
          <CardHeader title="Sipariş durumları" description="Duruma göre dağılım" />
          <SimpleBarChart
            items={statusChartItems}
            emptyMessage={
              statusQuery.isLoading ? 'Yükleniyor…' : 'Bu dönemde sipariş yok'
            }
          />
        </Card>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <Card padding="sm">
          <CardHeader
            title="En çok satan ürünler"
            description="Sipariş kalemlerine göre"
            action={
              <Link
                to="/admin/reports"
                className="text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Tüm raporlar
              </Link>
            }
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
              {summaryQuery.isLoading ? (
                <TableEmpty colSpan={3} message="Yükleniyor…" />
              ) : summary?.topProducts.length ? (
                summary.topProducts.map((product) => (
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
                <TableEmpty colSpan={3} message="Henüz satış verisi yok" />
              )}
            </TableBody>
          </Table>
        </Card>

        <Card padding="sm">
          <CardHeader
            title="Öne çıkan ürünler"
            description="Vitrin ve çok satan işaretli ürünler"
          />
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Ürün</TableHeaderCell>
                <TableHeaderCell>Etiket</TableHeaderCell>
                <TableHeaderCell className="text-right">Fiyat</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {summaryQuery.isLoading ? (
                <TableEmpty colSpan={3} message="Yükleniyor…" />
              ) : summary?.featuredProducts.length ? (
                summary.featuredProducts.map((product) => (
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
                      <div className="flex flex-wrap gap-1">
                        {product.isFeatured ? (
                          <Badge variant="success">Öne çıkan</Badge>
                        ) : null}
                        {product.isBestSeller ? (
                          <Badge>Çok satan</Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {product.price !== null
                        ? formatReportMoney(product.price)
                        : '—'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableEmpty colSpan={3} message="Öne çıkan ürün yok" />
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      <Card padding="sm">
        <CardHeader
          title="Son siparişler"
          description="En yeni siparişler"
          action={
            <Link
              to="/admin/orders"
              className="text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Tüm siparişler
            </Link>
          }
        />
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Sipariş</TableHeaderCell>
              <TableHeaderCell>Müşteri</TableHeaderCell>
              <TableHeaderCell>Durum</TableHeaderCell>
              <TableHeaderCell className="text-right">Tutar</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {summaryQuery.isLoading ? (
              <TableEmpty colSpan={4} message="Yükleniyor…" />
            ) : summary?.recentOrders.length ? (
              summary.recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="font-medium text-slate-900 hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                  </TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>
                    <Badge variant={orderStatusBadgeVariant(order.status)}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatMoney(order.grandTotal)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableEmpty colSpan={4} message="Henüz sipariş yok" />
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
