import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { CheckCheck, ExternalLink } from 'lucide-react';
import {
  getNotificationLink,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  NOTIFICATION_TYPE_LABELS,
} from '@/shared/api/notifications.api';
import type { NotificationDto } from '@/shared/types/api';
import {
  Badge,
  Button,
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

const PAGE_SIZE = 20;

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function NotificationsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const queryParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      unreadOnly: unreadOnly || undefined,
    }),
    [page, unreadOnly],
  );

  const notificationsQuery = useQuery({
    queryKey: ['admin', 'notifications', queryParams],
    queryFn: () => listNotifications(queryParams),
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
    },
  });

  const total = notificationsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleOpen = async (notification: NotificationDto) => {
    if (!notification.isRead) {
      await markReadMutation.mutateAsync(notification.id);
    }

    const link = getNotificationLink(notification);
    if (link) navigate(link);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Bildirimler"
          description="Sipariş, mesaj ve sistem bildirimleri"
          action={
            <div className="flex items-center gap-2">
              <Button
                variant={unreadOnly ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => {
                  setUnreadOnly((value) => !value);
                  setPage(1);
                }}
              >
                {unreadOnly ? 'Tümü' : 'Okunmamış'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
              >
                <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
                Tümünü okundu işaretle
              </Button>
            </div>
          }
        />

        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Tarih</TableHeaderCell>
              <TableHeaderCell>Tip</TableHeaderCell>
              <TableHeaderCell>Başlık</TableHeaderCell>
              <TableHeaderCell>Mesaj</TableHeaderCell>
              <TableHeaderCell>Durum</TableHeaderCell>
              <TableHeaderCell className="text-right">İşlem</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notificationsQuery.isLoading ? (
              <TableEmpty colSpan={6} message="Yükleniyor…" />
            ) : notificationsQuery.data?.items.length ? (
              notificationsQuery.data.items.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell className="whitespace-nowrap text-xs text-slate-500">
                    {formatDateTime(notification.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">
                      {NOTIFICATION_TYPE_LABELS[notification.type]}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-slate-900">
                    {notification.title}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-slate-600">
                    {notification.message}
                  </TableCell>
                  <TableCell>
                    <Badge variant={notification.isRead ? 'default' : 'warning'}>
                      {notification.isRead ? 'Okundu' : 'Yeni'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpen(notification)}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableEmpty colSpan={6} message="Bildirim bulunamadı" />
            )}
          </TableBody>
        </Table>

        {totalPages > 1 ? (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <p className="text-xs text-slate-500">
              Toplam {total} bildirim
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((value) => value - 1)}
              >
                Önceki
              </Button>
              <span className="text-xs text-slate-600">
                {page} / {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((value) => value + 1)}
              >
                Sonraki
              </Button>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
