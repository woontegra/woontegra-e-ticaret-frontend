import { AdminSubNav } from '@/admin/components/AdminSubNav';
import { Outlet } from 'react-router-dom';

const links = [
  { label: 'Site', path: '/admin/settings/site', end: true },
  { label: 'Firma', path: '/admin/settings/company' },
];

export function SettingsLayout() {
  return (
    <div className="space-y-2">
      <AdminSubNav links={links} ariaLabel="Ayarlar sekmeleri" />
      <Outlet />
    </div>
  );
}
