import { NavLink } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';

const links = [
  { label: 'Kampanyalar', path: '/admin/promotions/campaigns' },
  { label: 'Kuponlar', path: '/admin/promotions/coupons' },
];

export function PromotionSubNav() {
  return (
    <nav className="mb-4 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
      {links.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          className={({ isActive }) =>
            cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
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
