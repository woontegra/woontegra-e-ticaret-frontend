import { Outlet } from 'react-router-dom';
import { useIsMobile } from '@/shared/hooks/useMediaQuery';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import { Drawer } from '@/shared/ui/Drawer';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AdminLayout() {
  const isMobile = useIsMobile();
  const mobileNav = useDisclosure();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white lg:block">
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
        <main className="flex-1 overflow-auto p-3 md:p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
