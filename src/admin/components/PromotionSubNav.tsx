import { AdminSubNav } from '@/admin/components/AdminSubNav';

const links = [
  { label: 'Kampanyalar', path: '/admin/promotions/campaigns', end: true },
  { label: 'Kuponlar', path: '/admin/promotions/coupons' },
];

export function PromotionSubNav() {
  return <AdminSubNav links={links} ariaLabel="Pazarlama sekmeleri" />;
}
