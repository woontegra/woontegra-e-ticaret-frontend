import { AdminSubNav } from '@/admin/components/AdminSubNav';
import { Outlet } from 'react-router-dom';

const links = [
  { label: 'SEO ayarları', path: '/admin/seo', end: true },
  { label: 'Yönlendirmeler', path: '/admin/seo/redirects' },
];

export function SeoLayout() {
  return (
    <div className="space-y-2">
      <AdminSubNav links={links} ariaLabel="SEO sekmeleri" />
      <Outlet />
    </div>
  );
}
