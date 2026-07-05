import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Eye } from 'lucide-react';
import type { ContactMessageStatus } from '@/shared/types/api';
import {
  CONTACT_MESSAGE_STATUS_LABELS,
  getContactMessage,
  listContactMessages,
} from '@/shared/api/contact.api';
import { ContactSubNav } from '@/admin/components/ContactSubNav';
import { ContactMessageDetailPanel } from '@/admin/components/ContactMessageDetailPanel';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Drawer,
  Input,
  Label,
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

  return (
    <>
      <ContactSubNav />
      <Card padding="sm">
        <CardHeader title="İletişim mesajları" description="Public formlardan gelen mesajlar" />

        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <div>
            <Label>Ara</Label>
            <Input
              value={search}
              placeholder="Ad, e-posta, konu…"
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div>
            <Label>Durum</Label>
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as ContactMessageStatus | '');
                setPage(1);
              }}
            >
              <option value="">Tümü</option>
              {Object.entries(CONTACT_MESSAGE_STATUS_LABELS).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ),
              )}
            </Select>
          </div>
        </div>

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
            {messagesQuery.isLoading ? (
              <TableEmpty colSpan={5} message="Yükleniyor…" />
            ) : (messagesQuery.data?.items.length ?? 0) === 0 ? (
              <TableEmpty colSpan={5} message="Henüz mesaj yok." />
            ) : (
              messagesQuery.data!.items.map((item) => (
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
              ))
            )}
          </TableBody>
        </Table>

        {totalPages > 1 ? (
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-slate-500">
              Toplam {total} mesaj · Sayfa {page}/{totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Önceki
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Sonraki
              </Button>
            </div>
          </div>
        ) : null}
      </Card>

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
