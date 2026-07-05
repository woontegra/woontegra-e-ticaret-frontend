import { AdminSubNav } from '@/admin/components/AdminSubNav';

const links = [
  { label: 'Yazılar', path: '/admin/content/blog/posts', end: true },
  { label: 'Kategoriler', path: '/admin/content/blog/categories' },
];

export function BlogSubNav() {
  return <AdminSubNav links={links} ariaLabel="Blog sekmeleri" />;
}
