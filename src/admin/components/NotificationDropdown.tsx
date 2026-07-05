import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import {
  getNotificationLink,
  getUnreadNotificationCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/shared/api/notifications.api';
import type { NotificationDto } from '@/shared/types/api';
import { Button } from '@/shared/ui';

function formatRelativeTime(value: string): string {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) return 'Az önce';
  if (diffMinutes < 60) return `${diffMinutes} dk önce`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} sa önce`;

  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function NotificationDropdown() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const unreadQuery = useQuery({
    queryKey: ['admin', 'notifications', 'unread-count'],
    queryFn: getUnreadNotificationCount,
    refetchInterval: 30_000,
  });

  const recentQuery = useQuery({
    queryKey: ['admin', 'notifications', 'recent'],
    queryFn: () => listNotifications({ limit: 8 }),
    enabled: open,
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

  const unreadCount = unreadQuery.data?.count ?? 0;

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleOpenNotification = async (notification: NotificationDto) => {
    if (!notification.isRead) {
      await markReadMutation.mutateAsync(notification.id);
    }

    const link = getNotificationLink(notification);
    setOpen(false);
    if (link) navigate(link);
  };

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="ghost"
        size="sm"
        aria-label="Bildirimler"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </Button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-1 w-80 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
            <p className="text-xs font-semibold text-slate-900">Bildirimler</p>
            <div className="flex items-center gap-1">
              {unreadCount > 0 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-[10px]"
                  onClick={() => markAllReadMutation.mutate()}
                  disabled={markAllReadMutation.isPending}
                >
                  <CheckCheck className="mr-1 h-3 w-3" />
                  Tümünü oku
                </Button>
              ) : null}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[10px]"
                onClick={() => {
                  setOpen(false);
                  navigate('/admin/notifications');
                }}
              >
                Tümü
              </Button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {recentQuery.isLoading ? (
              <p className="px-3 py-6 text-center text-xs text-slate-500">
                Yükleniyor…
              </p>
            ) : recentQuery.data?.items.length ? (
              recentQuery.data.items.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  className={`flex w-full flex-col gap-0.5 border-b border-slate-50 px-3 py-2.5 text-left transition hover:bg-slate-50 ${
                    notification.isRead ? 'opacity-70' : 'bg-slate-50/50'
                  }`}
                  onClick={() => handleOpenNotification(notification)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-medium text-slate-900">
                      {notification.title}
                    </p>
                    {!notification.isRead ? (
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                    ) : null}
                  </div>
                  <p className="line-clamp-2 text-[11px] text-slate-600">
                    {notification.message}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {formatRelativeTime(notification.createdAt)}
                  </p>
                </button>
              ))
            ) : (
              <p className="px-3 py-6 text-center text-xs text-slate-500">
                Bildirim yok
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
