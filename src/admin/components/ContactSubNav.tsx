import { NavLink } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';

const links = [
  { label: 'Mesajlar', path: '/admin/contact' },
  { label: 'Formlar', path: '/admin/contact/forms' },
];

export function ContactSubNav() {
  return (
    <nav
      className="mb-3 flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-white p-1"
      aria-label="İletişim modülü sekmeleri"
    >
      {links.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          end={link.path === '/admin/contact'}
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
