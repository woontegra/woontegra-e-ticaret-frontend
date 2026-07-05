import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ReportDateRangeFilter } from '@/admin/components/ReportDateRangeFilter';
import {
  getAuditActions,
  getAuditModules,
  listAuditLogs,
} from '@/shared/api/audit.api';
import { listUsers } from '@/shared/api/users.api';
import { defaultReportDateRange } from '@/shared/api/reports.api';
import {
  AUDIT_ACTION_LABELS,
  AUDIT_MODULE_LABELS,
} from '@/shared/auth/roles';
import {
  Badge,
  Card,
  CardHeader,
  Select,
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/shared/ui';

const PAGE_SIZE = 20;

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AuditLogsPage() {
  const defaults = useMemo(() => defaultReportDateRange(), []);
  const [dateFrom, setDateFrom] = useState(defaults.dateFrom);
  const [dateTo, setDateTo] = useState(defaults.dateTo);
  const [userId, setUserId] = useState('');
  const [module, setModule] = useState('');
  const [action, setAction] = useState('');
  const [page, setPage] = useState(1);

  const queryParams = useMemo(
    () => ({
      dateFrom,
      dateTo,
      userId: userId || undefined,
      module: module || undefined,
      action: action || undefined,
      page,
      limit: PAGE_SIZE,
    }),
    [dateFrom, dateTo, userId, module, action, page],
  );

  const logsQuery = useQuery({
    queryKey: ['admin', 'audit-logs', queryParams],
    queryFn: () => listAuditLogs(queryParams),
  });

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: () => listUsers(),
  });

  const modulesQuery = useQuery({
    queryKey: ['admin', 'audit-logs', 'modules'],
    queryFn: getAuditModules,
  });

  const actionsQuery = useQuery({
    queryKey: ['admin', 'audit-logs', 'actions'],
    queryFn: getAuditActions,
  });

  const total = logsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <Card padding="sm">
        <CardHeader
          title="İşlem geçmişi"
          description="Kritik panel işlemlerinin audit kaydı"
        />
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <ReportDateRangeFilter
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={(value) => {
              setDateFrom(value);
              setPage(1);
            }}
            onDateToChange={(value) => {
              setDateTo(value);
              setPage(1);
            }}
          />
          <div>
            <label className="mb-1 block text-xs text-slate-500">Kullanıcı</label>
            <Select
              className="h-8 min-w-[160px] text-xs"
              value={userId}
              onChange={(event) => {
                setUserId(event.target.value);
                setPage(1);
              }}
            >
              <option value="">Tümü</option>
              {usersQuery.data?.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">Modül</label>
            <Select
              className="h-8 min-w-[140px] text-xs"
              value={module}
              onChange={(event) => {
                setModule(event.target.value);
                setPage(1);
              }}
            >
              <option value="">Tümü</option>
              {modulesQuery.data?.map((item) => (
                <option key={item} value={item}>
                  {AUDIT_MODULE_LABELS[item] ?? item}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">İşlem</label>
            <Select
              className="h-8 min-w-[180px] text-xs"
              value={action}
              onChange={(event) => {
                setAction(event.target.value);
                setPage(1);
              }}
            >
              <option value="">Tümü</option>
              {actionsQuery.data?.map((item) => (
                <option key={item} value={item}>
                  {AUDIT_ACTION_LABELS[item] ?? item}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      <Card padding="sm">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Tarih</TableHeaderCell>
              <TableHeaderCell>Kullanıcı</TableHeaderCell>
              <TableHeaderCell>Modül</TableHeaderCell>
              <TableHeaderCell>İşlem</TableHeaderCell>
              <TableHeaderCell>Detay</TableHeaderCell>
              <TableHeaderCell>IP</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logsQuery.isLoading ? (
              <TableEmpty colSpan={6} message="Yükleniyor…" />
            ) : logsQuery.data?.items.length ? (
              logsQuery.data.items.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap text-xs text-slate-500">
                    {formatDateTime(log.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-slate-900">
                        {log.userName ?? 'Sistem'}
                      </p>
                      {log.userEmail ? (
                        <p className="text-xs text-slate-500">{log.userEmail}</p>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge>{AUDIT_MODULE_LABELS[log.module] ?? log.module}</Badge>
                  </TableCell>
                  <TableCell>
                    {AUDIT_ACTION_LABELS[log.action] ?? log.action}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-xs text-slate-600">
                    {log.entityType && log.entityId
                      ? `${log.entityType}:${log.entityId}`
                      : '—'}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {log.ipAddress ?? '—'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableEmpty colSpan={6} message="Kayıt bulunamadı" />
            )}
          </TableBody>
        </Table>

        {totalPages > 1 ? (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <p className="text-xs text-slate-500">Toplam {total} kayıt</p>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                className="rounded border px-2 py-1 disabled:opacity-50"
                disabled={page <= 1}
                onClick={() => setPage((value) => value - 1)}
              >
                Önceki
              </button>
              <span>
                {page} / {totalPages}
              </span>
              <button
                type="button"
                className="rounded border px-2 py-1 disabled:opacity-50"
                disabled={page >= totalPages}
                onClick={() => setPage((value) => value + 1)}
              >
                Sonraki
              </button>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
