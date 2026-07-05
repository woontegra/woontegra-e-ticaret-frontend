import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Menu,
  Search,
  ShoppingCart,
  User,
} from 'lucide-react';
import type { HeaderSettingDto, PublicMenusDto, SiteSettingDto } from '@/shared/types/api';
import { PublicNavItems } from '@/storefront/components/PublicNavItems';
import { cn } from '@/shared/lib/cn';

interface PublicHeaderProps {
  siteSettings?: SiteSettingDto;
  menus?: PublicMenusDto;
  headerSettings?: HeaderSettingDto;
  cartItemCount?: number;
}

function HeaderLogo({
  siteSettings,
}: {
  siteSettings?: SiteSettingDto;
}) {
  const siteName = siteSettings?.siteName;
  const logoUrl = siteSettings?.logoUrl;

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={siteName || ''}
        className="h-8 max-w-[160px] object-contain"
      />
    );
  }

  if (siteName) {
    return <span className="theme-heading truncate text-base">{siteName}</span>;
  }

  return null;
}

function HeaderIcons({
  settings,
  cartItemCount = 0,
}: {
  settings: HeaderSettingDto;
  cartItemCount?: number;
}) {
  const iconClass =
    'theme-header-link inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-theme-surface';

  return (
    <div className="flex items-center gap-1">
      {settings.showSearch ? (
        <button type="button" className={iconClass} aria-label="Ara">
          <Search className="h-5 w-5" />
        </button>
      ) : null}
      {settings.showAccountIcon ? (
        <Link to="/admin/login" className={iconClass} aria-label="Hesabım">
          <User className="h-5 w-5" />
        </Link>
      ) : null}
      {settings.showFavoritesIcon ? (
        <button type="button" className={iconClass} aria-label="Favoriler">
          <Heart className="h-5 w-5" />
        </button>
      ) : null}
      {settings.showCartIcon ? (
        <Link to="/sepet" className={`${iconClass} relative`} aria-label="Sepet">
          <ShoppingCart className="h-5 w-5" />
          {cartItemCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-900 px-1 text-[10px] font-medium text-white">
              {cartItemCount > 99 ? '99+' : cartItemCount}
            </span>
          ) : null}
        </Link>
      ) : null}
    </div>
  );
}

export function PublicHeader({
  siteSettings,
  menus,
  headerSettings,
  cartItemCount,
}: PublicHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!headerSettings) return null;

  const headerItems = menus?.header?.items ?? [];
  const mobileItems = menus?.mobile?.items?.length
    ? menus.mobile.items
    : headerItems;

  const showDesktopMenu = headerItems.length > 0;

  return (
    <header
      className={cn(
        'theme-header border-b',
        headerSettings.stickyHeader && 'sticky top-0 z-50',
      )}
    >
      {headerSettings.topBarEnabled && headerSettings.topBarText ? (
        <div
          className="px-4 py-1.5 text-center text-xs sm:text-sm"
          style={{
            backgroundColor: headerSettings.topBarBackground ?? undefined,
            color: headerSettings.topBarTextColor ?? undefined,
          }}
        >
          {headerSettings.topBarText}
        </div>
      ) : null}

      {headerSettings.announcementEnabled && headerSettings.announcementText ? (
        <div className="border-b border-theme-border bg-theme-surface px-4 py-2 text-center text-sm text-theme-text">
          {headerSettings.announcementLink ? (
            <a
              href={headerSettings.announcementLink}
              className="theme-link font-medium hover:underline"
            >
              {headerSettings.announcementText}
            </a>
          ) : (
            headerSettings.announcementText
          )}
        </div>
      ) : null}

      <nav
        className="theme-container theme-container-padding mx-auto flex w-full items-center px-4 sm:px-6 lg:px-8"
        style={{ minHeight: headerSettings.headerHeight }}
        aria-label="Ana menü"
      >
        <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="flex items-center justify-start gap-4">
            {headerSettings.logoPosition === 'LEFT' ? (
              <Link to="/" className="flex min-w-0 items-center">
                <HeaderLogo siteSettings={siteSettings} />
              </Link>
            ) : null}
            {headerSettings.menuPosition === 'LEFT' && showDesktopMenu ? (
              <div className="hidden md:block">
                <PublicNavItems
                  items={headerItems}
                  className="flex list-none flex-row items-center gap-4"
                  linkClassName="theme-header-link"
                />
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-center gap-4">
            {headerSettings.logoPosition === 'CENTER' ? (
              <Link to="/" className="flex min-w-0 items-center">
                <HeaderLogo siteSettings={siteSettings} />
              </Link>
            ) : null}
            {headerSettings.menuPosition === 'CENTER' && showDesktopMenu ? (
              <div className="hidden md:block">
                <PublicNavItems
                  items={headerItems}
                  className="flex list-none flex-row items-center gap-4"
                  linkClassName="theme-header-link"
                />
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-2">
            {headerSettings.menuPosition === 'RIGHT' && showDesktopMenu ? (
              <div className="hidden md:mr-2 md:block">
                <PublicNavItems
                  items={headerItems}
                  className="flex list-none flex-row items-center gap-4"
                  linkClassName="theme-header-link"
                />
              </div>
            ) : null}
            <div className="hidden md:flex">
              <HeaderIcons
                settings={headerSettings}
                cartItemCount={cartItemCount}
              />
            </div>
            <button
              type="button"
              className="theme-header-link inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-theme-surface md:hidden"
              aria-label="Menüyü aç"
              onClick={() => setMobileOpen((open) => !open)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen ? (
        <div className="border-t border-theme-border px-4 py-3 md:hidden">
          {mobileItems.length > 0 ? (
            <PublicNavItems
              items={mobileItems}
              className="space-y-2 text-sm"
              linkClassName="theme-header-link"
            />
          ) : null}
          <div className="mt-3 flex gap-1 border-t border-theme-border pt-3">
            <HeaderIcons
              settings={headerSettings}
              cartItemCount={cartItemCount}
            />
          </div>
        </div>
      ) : null}
    </header>
  );
}
