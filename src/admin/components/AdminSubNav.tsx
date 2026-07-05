import { NavLink } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';

export interface AdminSubNavLink {
  label: string;
  path: string;
  end?: boolean;
}

interface AdminSubNavProps {
  links: AdminSubNavLink[];
  ariaLabel: string;
  className?: string;
}

export function AdminSubNav({ links, ariaLabel, className }: AdminSubNavProps) {
  return (
    <nav
      className={cn(
        'mb-2 flex flex-wrap gap-0.5 overflow-x-auto border-b border-slate-200 pb-2',
        className,
      )}
      aria-label={ariaLabel}
    >
      {links.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          end={link.end}
          className={({ isActive }) =>
            cn(
              'whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium transition-colors sm:text-sm',
              isActive
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
            )
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}
