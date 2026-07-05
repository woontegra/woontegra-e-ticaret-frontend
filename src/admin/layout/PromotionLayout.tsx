import { Outlet } from 'react-router-dom';
import { AdminSubNav } from '@/admin/components/AdminSubNav';

const links = [
  { label: 'Kampanyalar', path: '/admin/promotions/campaigns', end: true },
  { label: 'Kuponlar', path: '/admin/promotions/coupons' },
];

export function PromotionLayout() {
  return (
    <div className="space-y-2">
      <AdminSubNav links={links} ariaLabel="Pazarlama sekmeleri" />
      <Outlet />
    </div>
  );
}
