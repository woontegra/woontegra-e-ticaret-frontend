import { NavLink } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';

const links = [
  { label: 'SMTP Ayarları', path: '/admin/settings/mail' },
  { label: 'Mail Şablonları', path: '/admin/settings/mail/templates' },
];

export function MailSettingsSubNav() {
  return (
    <nav
      className="mb-3 flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-white p-1"
      aria-label="Mail modülü sekmeleri"
    >
      {links.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          end={link.path === '/admin/settings/mail'}
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
