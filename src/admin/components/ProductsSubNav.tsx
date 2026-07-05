import { AdminSubNav } from '@/admin/components/AdminSubNav';

const links = [
  { label: 'Ürünler / Yazılımlar', path: '/admin/products', end: true },
  { label: 'Kategoriler', path: '/admin/products/categories' },
  { label: 'Markalar', path: '/admin/products/brands' },
  { label: 'Özellikler', path: '/admin/products/attributes' },
];

export function ProductsSubNav() {
  return <AdminSubNav links={links} ariaLabel="Katalog sekmeleri" />;
}
