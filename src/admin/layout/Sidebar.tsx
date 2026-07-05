import { NavLink } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';
import { hasAnyRole } from '@/shared/auth/roles';
import { useAuthStore } from '@/shared/auth/auth.store';
import { adminNavigation } from '@/admin/config/navigation';

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const userRole = useAuthStore((state) => state.user?.role);

  const visibleNavigation = adminNavigation
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.roles || hasAnyRole(userRole, item.roles),
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="flex h-full flex-col bg-[rgb(var(--admin-sidebar))]">
      <div className="flex h-14 items-center border-b border-[rgb(var(--admin-border))] px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--admin-primary))] text-xs font-bold text-white shadow-[var(--admin-shadow-sm)]">
            W
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[rgb(var(--admin-text))]">
              Woontegra
            </p>
            <p className="truncate text-[11px] text-[rgb(var(--admin-text-muted))]">
              Yönetim Paneli
            </p>
          </div>
        </div>
      </div>

      <nav
        className="flex-1 overflow-y-auto px-2 py-3"
        aria-label="Admin menü"
      >
        {visibleNavigation.map((group) => (
          <div key={group.label} className="mb-4 last:mb-0">
            <p className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-widest text-[rgb(var(--admin-text-muted))]">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      end={item.end}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-all',
                          isActive
                            ? 'bg-[rgb(var(--admin-sidebar-active))] text-white shadow-[var(--admin-shadow-sm)]'
                            : 'text-[rgb(var(--admin-text-muted))] hover:bg-[rgb(var(--admin-sidebar-hover))] hover:text-[rgb(var(--admin-text))]',
                        )
                      }
                    >
                      <Icon className="h-4 w-4 shrink-0 opacity-90" />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}
