import { Outlet, useLocation } from 'react-router-dom';
import { PublicFooter } from '@/storefront/components/PublicFooter';
import { PublicHeader } from '@/storefront/components/PublicHeader';
import { SeoHead } from '@/storefront/components/SeoHead';
import {
  usePublicCompanySettings,
  usePublicSeoSettings,
  usePublicSiteSettings,
} from '@/storefront/hooks/usePublicSettings';
import { usePublicFooter } from '@/storefront/hooks/usePublicFooter';
import { usePublicMenus } from '@/storefront/hooks/usePublicMenus';
import { usePublicHeaderSettings } from '@/storefront/hooks/usePublicHeaderSettings';
import { usePublicTheme } from '@/storefront/hooks/usePublicTheme';
import { useCart } from '@/storefront/hooks/useCart';
import { ThemeProvider } from '@/storefront/theme/ThemeProvider';

export function PublicLayout() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const siteQuery = usePublicSiteSettings();
  const seoQuery = usePublicSeoSettings();
  const companyQuery = usePublicCompanySettings();
  const menusQuery = usePublicMenus();
  const footerQuery = usePublicFooter();
  const themeQuery = usePublicTheme();
  const headerSettingsQuery = usePublicHeaderSettings();
  const { itemCount } = useCart();

  if (siteQuery.data?.maintenanceMode) {
    return (
      <>
        <SeoHead siteSettings={siteQuery.data} seoSettings={seoQuery.data} />
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
          <div className="max-w-md text-center">
            {siteQuery.data.siteName ? (
              <p className="text-lg font-semibold text-slate-900">
                {siteQuery.data.siteName}
              </p>
            ) : null}
            {(siteQuery.data.siteDescription || siteQuery.data.defaultSeoDescription) && (
              <p className="mt-3 text-sm text-slate-600">
                {siteQuery.data.siteDescription || siteQuery.data.defaultSeoDescription}
              </p>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <ThemeProvider theme={themeQuery.data}>
      <SeoHead siteSettings={siteQuery.data} seoSettings={seoQuery.data} />
      <PublicHeader
        siteSettings={siteQuery.data}
        menus={menusQuery.data}
        headerSettings={headerSettingsQuery.data}
        cartItemCount={itemCount}
      />
      <main
        className={
          isHomePage
            ? 'w-full flex-1'
            : 'theme-container theme-container-padding mx-auto w-full flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8'
        }
      >
        <Outlet context={{ siteSettings: siteQuery.data, companySettings: companyQuery.data }} />
      </main>
      <PublicFooter footer={footerQuery.data} />
    </ThemeProvider>
  );
}
