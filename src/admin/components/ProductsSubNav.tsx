import { NavLink } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';

const links = [
  { label: 'Ürünler / Yazılımlar', path: '/admin/products' },
  { label: 'Kategoriler', path: '/admin/products/categories' },
  { label: 'Markalar', path: '/admin/products/brands' },
  { label: 'Özellikler', path: '/admin/products/attributes' },
];

export function ProductsSubNav() {
  return (
    <nav
      className="mb-3 flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-white p-1"
      aria-label="Ürün modülü sekmeleri"
    >
      {links.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          end={link.path === '/admin/products'}
          className={({ isActive }) =>
            cn(
              'rounded-md px-3 py-1.5 text-sm transition-colors',
              isActive
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100',
            )
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}
