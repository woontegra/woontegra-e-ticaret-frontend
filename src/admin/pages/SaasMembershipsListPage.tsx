import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { SaasMembershipStatus } from '@/shared/types/api';
import {
  listSaasMemberships,
  SAAS_MEMBERSHIP_STATUS_LABELS,
} from '@/shared/api/saas.api';
import { ListPageShell } from '@/admin/components/ui';
import { TableQueryState } from '@/admin/components/TableQueryState';
import {
  Badge,
  Button,
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
const COL_SPAN = 9;

export function SaasMembershipsListPage() {
  const [customer, setCustomer] = useState('');
  const [saasAppCode, setSaasAppCode] = useState('');
  const [statusFilter, setStatusFilter] = useState<SaasMembershipStatus | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);

  const queryParams = useMemo(
    () => ({
      customer: customer || undefined,
      saasAppCode: saasAppCode || undefined,
      status: statusFilter || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      page,
      limit: PAGE_SIZE,
    }),
    [customer, saasAppCode, statusFilter, dateFrom, dateTo, page],
  );

  const query = useQuery({
    queryKey: ['admin', 'saas-memberships', queryParams],
    queryFn: () => listSaasMemberships(queryParams),
  });

  const total = query.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const items = query.data?.items ?? [];

  const resetFilters = () => {
    setCustomer('');
    setSaasAppCode('');
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  return (
    <ListPageShell
      title="SaaS Üyelikleri"
      description="Harici SaaS uygulamalarında oluşturulan müşteri hesaplarını izleyin."
      filters={
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <Label htmlFor="customer">Müşteri / e-posta</Label>
            <Input
              id="customer"
              value={customer}
              onChange={(event) => {
                setCustomer(event.target.value);
                setPage(1);
              }}
              placeholder="Ara…"
            />
          </div>
          <div>
            <Label htmlFor="saasAppCode">SaaS uygulama</Label>
            <Input
              id="saasAppCode"
              value={saasAppCode}
              onChange={(event) => {
                setSaasAppCode(event.target.value);
                setPage(1);
              }}
              placeholder="MUVEKKIL_KASA_SAAS"
            />
          </div>
          <div>
            <Label htmlFor="status">Durum</Label>
            <Select
              id="status"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as SaasMembershipStatus | '');
                setPage(1);
              }}
            >
              <option value="">Tümü</option>
              {Object.entries(SAAS_MEMBERSHIP_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="dateFrom">Başlangıç</Label>
            <Input
              id="dateFrom"
              type="date"
              value={dateFrom}
              onChange={(event) => {
                setDateFrom(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <div>
            <Label htmlFor="dateTo">Bitiş</Label>
            <Input
              id="dateTo"
              type="date"
              value={dateTo}
              onChange={(event) => {
                setDateTo(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="flex items-end sm:col-span-2 lg:col-span-5">
            <Button size="sm" variant="secondary" onClick={resetFilters}>
              Filtreleri temizle
            </Button>
          </div>
        </div>
      }
      footer={
        totalPages > 1 ? (
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        ) : null
      }
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Müşteri</TableHeaderCell>
            <TableHeaderCell>Ürün</TableHeaderCell>
            <TableHeaderCell>SaaS app</TableHeaderCell>
            <TableHeaderCell>Tenant slug</TableHeaderCell>
            <TableHeaderCell>Durum</TableHeaderCell>
            <TableHeaderCell>Başlangıç</TableHeaderCell>
            <TableHeaderCell>Bitiş</TableHeaderCell>
            <TableHeaderCell>Sipariş no</TableHeaderCell>
            <TableHeaderCell>İşlemler</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableQueryState
            colSpan={COL_SPAN}
            isLoading={query.isLoading}
            isError={query.isError}
            isEmpty={!query.isLoading && items.length === 0}
            emptyMessage="SaaS üyeliği bulunamadı."
          >
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{item.customerName ?? '—'}</p>
                    <p className="text-xs text-slate-500">{item.customerEmail ?? '—'}</p>
                  </div>
                </TableCell>
                <TableCell>{item.productName}</TableCell>
                <TableCell>
                  <div>
                    <p>{item.saasAppCode}</p>
                    {item.saasPlanCode ? (
                      <p className="text-xs text-slate-500">{item.saasPlanCode}</p>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>{item.tenantSlug ?? '—'}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      item.status === 'ACTIVE'
                        ? 'success'
                        : item.status === 'FAILED'
                          ? 'danger'
                          : 'default'
                    }
                  >
                    {SAAS_MEMBERSHIP_STATUS_LABELS[item.status]}
                  </Badge>
                  {item.lastError ? (
                    <p
                      className="mt-1 max-w-xs truncate text-xs text-red-600"
                      title={item.lastError}
                    >
                      {item.lastError}
                    </p>
                  ) : null}
                </TableCell>
                <TableCell>
                  {item.startsAt
                    ? new Date(item.startsAt).toLocaleDateString('tr-TR')
                    : '—'}
                </TableCell>
                <TableCell>
                  {item.endsAt
                    ? new Date(item.endsAt).toLocaleDateString('tr-TR')
                    : '—'}
                </TableCell>
                <TableCell>{item.orderNumber ?? '—'}</TableCell>
                <TableCell>
                  {item.loginUrl ? (
                    <a
                      href={item.loginUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-slate-900 underline"
                    >
                      Giriş
                    </a>
                  ) : (
                    '—'
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableQueryState>
        </TableBody>
      </Table>

      <p className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
        Detaylı provisioning bilgisi için{' '}
        <Link to="/admin/orders" className="underline">
          sipariş detayına
        </Link>{' '}
        bakın.
      </p>
    </ListPageShell>
  );
}
