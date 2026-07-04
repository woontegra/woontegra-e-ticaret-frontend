import { Link } from 'react-router-dom';
import type { SiteSettingDto } from '@/shared/types/api';

interface PublicHeaderProps {
  siteSettings?: SiteSettingDto;
}

export function PublicHeader({ siteSettings }: PublicHeaderProps) {
  const siteName = siteSettings?.siteName;
  const logoUrl = siteSettings?.logoUrl;

  return (
    <header className="border-b border-slate-200">
      <nav
        className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8"
        aria-label="Ana menü"
      >
        <Link to="/" className="flex min-w-0 items-center gap-2">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={siteName || ''}
              className="h-8 max-w-[160px] object-contain"
            />
          ) : siteName ? (
            <span className="truncate text-base font-semibold text-slate-900">
              {siteName}
            </span>
          ) : (
            <span className="h-8 w-24 rounded bg-slate-100" aria-hidden />
          )}
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link to="/" className="text-slate-600 hover:text-slate-900">
            Ana sayfa
          </Link>
          <Link to="/iletisim" className="text-slate-600 hover:text-slate-900">
            İletişim
          </Link>
        </div>
      </nav>
    </header>
  );
}
