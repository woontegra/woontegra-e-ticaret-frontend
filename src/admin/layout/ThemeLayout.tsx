import { AdminSubNav } from '@/admin/components/AdminSubNav';
import { Outlet } from 'react-router-dom';

const links = [
  { label: 'Tema', path: '/admin/theme/settings', end: true },
  { label: 'Header', path: '/admin/theme/header' },
  { label: 'Builder', path: '/admin/theme/builder' },
];

export function ThemeLayout() {
  return (
    <div className="space-y-2">
      <AdminSubNav links={links} ariaLabel="Tasarım sekmeleri" />
      <Outlet />
    </div>
  );
}
