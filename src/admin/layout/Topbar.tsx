import { useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Menu, Search } from 'lucide-react';
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

  const pageTitle = getAdminPageTitle(location.pathname);  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.email ?? 'Kullanıcı';

  const handleLogout = () => {
    logoutMutation.mutate();
  };
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-3 lg:px-4">
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
        <h1 className="truncate text-sm font-semibold text-slate-900">
          {pageTitle}
        </h1>
      </div>

      <div className="hidden max-w-xs flex-1 md:block">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Hızlı ara…" className="h-8 pl-8 text-xs" />
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" aria-label="Bildirimler">
          <Bell className="h-4 w-4" />
        </Button>

        <div className="hidden items-center gap-2 border-l border-slate-200 pl-2 sm:flex">
          <div className="min-w-0 text-right">
            <p className="truncate text-xs font-medium text-slate-900">
              {displayName}
            </p>
            {user?.role ? (
              <p className="truncate text-[10px] text-slate-500">{user.role}</p>
            ) : null}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            aria-label="Çıkış yap"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
