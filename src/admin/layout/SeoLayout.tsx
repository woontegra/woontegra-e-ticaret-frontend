import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';

const tabs = [
  { label: 'SEO Ayarları', path: '/admin/seo' },
  { label: 'Yönlendirmeler', path: '/admin/seo/redirects' },
];

export function SeoLayout() {
  return (
    <div className="space-y-3">
      <nav
        className="flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-white p-1"
        aria-label="SEO sekmeleri"
      >
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            end={tab.path === '/admin/seo'}
            className={({ isActive }) =>
              cn(
                'rounded-md px-3 py-1.5 text-sm transition-colors',
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100',
              )
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
