import { AdminSubNav } from '@/admin/components/AdminSubNav';

const links = [
  { label: 'Kargo firmaları', path: '/admin/shipping/carriers', end: true },
  { label: 'Kargo yöntemleri', path: '/admin/shipping/methods' },
];

export function ShippingSubNav() {
  return <AdminSubNav links={links} ariaLabel="Kargo sekmeleri" />;
}
