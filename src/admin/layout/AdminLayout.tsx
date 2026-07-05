import { Outlet } from 'react-router-dom';
import { useIsMobile } from '@/shared/hooks/useMediaQuery';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import { Drawer } from '@/shared/ui/Drawer';
import { Toaster } from '@/shared/ui/Toast';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AdminLayout() {
  const isMobile = useIsMobile();
  const mobileNav = useDisclosure();

  return (
    <div className="admin-shell flex min-h-screen overflow-x-hidden bg-[rgb(var(--admin-bg))]">
      <aside
        className="hidden shrink-0 border-r border-[rgb(var(--admin-border))] bg-[rgb(var(--admin-sidebar))] lg:block"
        style={{ width: 'var(--sidebar-width)' }}
      >
        <Sidebar />
      </aside>

      <Drawer
        isOpen={isMobile && mobileNav.isOpen}
        onClose={mobileNav.close}
        title="Menü"
        side="left"
      >
        <Sidebar onNavigate={mobileNav.close} />
      </Drawer>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={mobileNav.open} />
        <main className="flex-1 overflow-auto p-4 md:p-5">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
