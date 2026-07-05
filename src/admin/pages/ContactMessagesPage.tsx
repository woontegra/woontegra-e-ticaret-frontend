import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Eye } from 'lucide-react';
import type { ContactMessageStatus } from '@/shared/types/api';
import {
  CONTACT_MESSAGE_STATUS_LABELS,
  getContactMessage,
  listContactMessages,
} from '@/shared/api/contact.api';
import { AdminPanel } from '@/admin/components/AdminPanel';
import { ContactSubNav } from '@/admin/components/ContactSubNav';
import { ContactMessageDetailPanel } from '@/admin/components/ContactMessageDetailPanel';
import { TableQueryState } from '@/admin/components/TableQueryState';
import {
  Badge,
  Button,
  Drawer,
  FilterBar,
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

export function ContactMessagesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContactMessageStatus | ''>('');
  const [page, setPage] = useState(1);
  const [drawerId, setDrawerId] = useState<string | null>(null);

  const queryParams = useMemo(
    () => ({
      search: search || undefined,
      status: statusFilter || undefined,
      page,
      limit: PAGE_SIZE,
    }),
    [search, statusFilter, page],
  );

  const messagesQuery = useQuery({
    queryKey: ['admin', 'contact-messages', queryParams],
    queryFn: () => listContactMessages(queryParams),
  });

  const drawerQuery = useQuery({
    queryKey: ['admin', 'contact-messages', drawerId],
    queryFn: () => getContactMessage(drawerId!),
    enabled: Boolean(drawerId),
  });

  const total = messagesQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const items = messagesQuery.data?.items ?? [];

  return (
    <>
      <ContactSubNav />
      <AdminPanel
        filters={
          <FilterBar
            searchValue={search}
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            searchPlaceholder="Ad, e-posta, konu…"
          >
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as ContactMessageStatus | '');
                setPage(1);
              }}
              className="h-8 text-xs"
            >
              <option value="">Tüm durumlar</option>
              {Object.entries(CONTACT_MESSAGE_STATUS_LABELS).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ),
              )}
            </Select>
          </FilterBar>
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
              <TableHeaderCell>Tarih</TableHeaderCell>
              <TableHeaderCell>Gönderen</TableHeaderCell>
              <TableHeaderCell>Konu</TableHeaderCell>
              <TableHeaderCell>Durum</TableHeaderCell>
              <TableHeaderCell className="text-right">İşlem</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableQueryState
              colSpan={5}
              isLoading={messagesQuery.isLoading}
              isError={messagesQuery.isError}
              isEmpty={items.length === 0}
              emptyMessage="Henüz mesaj yok."
            >
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-slate-500">
                    {new Date(item.createdAt).toLocaleString('tr-TR')}
                  </TableCell>
                  <TableCell>
                    <p>{item.name}</p>
                    <p className="text-xs text-slate-500">{item.email}</p>
                  </TableCell>
                  <TableCell>{item.subject ?? '—'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={item.status === 'NEW' ? 'warning' : 'default'}
                    >
                      {CONTACT_MESSAGE_STATUS_LABELS[item.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDrawerId(item.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableQueryState>
          </TableBody>
        </Table>
      </AdminPanel>

      <Drawer
        isOpen={Boolean(drawerId)}
        onClose={() => setDrawerId(null)}
        title="Mesaj detayı"
        size="lg"
      >
        {drawerQuery.data ? (
          <ContactMessageDetailPanel message={drawerQuery.data} />
        ) : (
          <p className="text-sm text-slate-500">Yükleniyor…</p>
        )}
      </Drawer>
    </>
  );
}
