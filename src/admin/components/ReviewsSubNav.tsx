import { AdminSubNav } from '@/admin/components/AdminSubNav';

const links = [
  { label: 'Tüm yorumlar', path: '/admin/reviews', end: true },
];

export function ReviewsSubNav() {
  return <AdminSubNav links={links} ariaLabel="Yorum sekmeleri" />;
}
