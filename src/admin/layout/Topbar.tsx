import { useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, Search } from 'lucide-react';
import { NotificationDropdown } from '@/admin/components/NotificationDropdown';
import { getAdminPageTitle } from '@/admin/config/navigation';
import { logout as logoutApi } from '@/shared/api/auth.api';
import { useAuthStore } from '@/shared/auth/auth.store';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const logoutMutation = useMutation({
    mutationFn: logoutApi,
    onSettled: () => {
      logout();
      navigate('/admin/login', { replace: true });
    },
  });

  const pageTitle = getAdminPageTitle(location.pathname);
  const displayName = user?.name ?? user?.email ?? 'Kullanıcı';

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[rgb(var(--admin-border))] bg-[rgb(var(--admin-surface))] px-4 shadow-[var(--admin-shadow-sm)] lg:px-5">
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden"
        onClick={onMenuClick}
        aria-label="Menüyü aç"
      >
        <Menu className="h-4 w-4" />
      </Button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-sm font-semibold text-[rgb(var(--admin-text))]">
          {pageTitle}
        </h1>
      </div>

      <div className="hidden max-w-xs flex-1 md:block">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[rgb(var(--admin-text-muted))]" />
          <Input
            placeholder="Hızlı ara…"
            className="h-9 border-[rgb(var(--admin-border))] bg-[rgb(var(--admin-surface-muted))] pl-9 text-xs"
          />
        </div>
      </div>

      <div className="flex items-center gap-1">
        <NotificationDropdown />

        <div className="hidden items-center gap-2 border-l border-[rgb(var(--admin-border))] pl-3 sm:flex">
          <div className="min-w-0 text-right">
            <p className="truncate text-xs font-medium text-[rgb(var(--admin-text))]">
              {displayName}
            </p>
            {user?.role ? (
              <p className="truncate text-[10px] text-[rgb(var(--admin-text-muted))]">
                {user.role}
              </p>
            ) : null}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => logoutMutation.mutate()}
            aria-label="Çıkış yap"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
