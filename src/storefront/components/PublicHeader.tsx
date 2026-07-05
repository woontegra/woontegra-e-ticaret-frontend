import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  Menu,
  Search,
  ShoppingCart,
  User,
  X,
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

function HeaderLogo({ siteSettings }: { siteSettings?: SiteSettingDto }) {
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
  onSearchClick,
}: {
  settings: HeaderSettingDto;
  cartItemCount?: number;
  onSearchClick?: () => void;
}) {
  const iconClass =
    'theme-header-link inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-theme-surface';
  const cartHref = settings.cartUrl?.trim() || '/sepet';
  const accountHref = settings.accountUrl?.trim();
  const favoritesHref = settings.favoritesUrl?.trim();

  return (
    <div className="flex items-center gap-1">
      {settings.showSearch ? (
        <button type="button" className={iconClass} onClick={onSearchClick}>
          <Search className="h-5 w-5" />
        </button>
      ) : null}
      {settings.showAccountIcon && accountHref ? (
        accountHref.startsWith('http') ? (
          <a href={accountHref} className={iconClass}>
            <User className="h-5 w-5" />
          </a>
        ) : (
          <Link to={accountHref} className={iconClass}>
            <User className="h-5 w-5" />
          </Link>
        )
      ) : null}
      {settings.showFavoritesIcon && favoritesHref ? (
        favoritesHref.startsWith('http') ? (
          <a href={favoritesHref} className={iconClass}>
            <Heart className="h-5 w-5" />
          </a>
        ) : (
          <Link to={favoritesHref} className={iconClass}>
            <Heart className="h-5 w-5" />
          </Link>
        )
      ) : null}
      {settings.showCartIcon ? (
        <Link to={cartHref} className={`${iconClass} relative`}>
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

function HeaderSearchOverlay({
  open,
  onClose,
  placeholder,
}: {
  open: boolean;
  onClose: () => void;
  placeholder?: string | null;
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) {
      setQuery('');
      return;
    }
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open || !placeholder?.trim()) return null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/arama?q=${encodeURIComponent(trimmed)}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="relative mx-auto mt-20 w-full max-w-lg px-4">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 rounded-lg bg-white p-2 shadow-xl"
        >
          <Search className="ml-2 h-5 w-5 shrink-0 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
            autoFocus
            className="flex-1 border-0 bg-transparent px-2 py-2 text-sm outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </form>
      </div>
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
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  if (!headerSettings) return null;

  const headerItems = menus?.header?.items ?? [];
  const mobileItems = menus?.mobile?.items?.length
    ? menus.mobile.items
    : headerItems;

  const showDesktopMenu = headerItems.length > 0;
  const openSearch = () => {
    if (headerSettings.searchPlaceholder?.trim()) {
      setSearchOpen(true);
    }
  };

  return (
    <>
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
                  onSearchClick={openSearch}
                />
              </div>
              <button
                type="button"
                className="theme-header-link inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-theme-surface md:hidden"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </nav>
      </header>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <HeaderLogo siteSettings={siteSettings} />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {mobileItems.length > 0 ? (
                <PublicNavItems
                  items={mobileItems}
                  className="space-y-3 text-base"
                  linkClassName="theme-header-link block py-1"
                  onNavigate={() => setMobileOpen(false)}
                />
              ) : null}
            </div>
            <div className="border-t border-slate-200 px-4 py-3">
              <HeaderIcons
                settings={headerSettings}
                cartItemCount={cartItemCount}
                onSearchClick={() => {
                  setMobileOpen(false);
                  openSearch();
                }}
              />
            </div>
          </div>
        </div>
      ) : null}

      <HeaderSearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        placeholder={headerSettings.searchPlaceholder}
      />
    </>
  );
}
