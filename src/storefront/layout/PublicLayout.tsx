import { Outlet } from 'react-router-dom';
import { PublicFooter } from '@/storefront/components/PublicFooter';
import { PublicHeader } from '@/storefront/components/PublicHeader';
import { SeoHead } from '@/storefront/components/SeoHead';
import {
  usePublicCompanySettings,
  usePublicSiteSettings,
} from '@/storefront/hooks/usePublicSettings';

export function PublicLayout() {
  const siteQuery = usePublicSiteSettings();
  const companyQuery = usePublicCompanySettings();

  if (siteQuery.data?.maintenanceMode) {
    return (
      <>
        <SeoHead siteSettings={siteQuery.data} />
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
          <div className="max-w-md text-center">
            {siteQuery.data.siteName ? (
              <p className="text-lg font-semibold text-slate-900">
                {siteQuery.data.siteName}
              </p>
            ) : null}
            <p className="mt-3 text-sm text-slate-600">
              {siteQuery.data.siteDescription ||
                'Site şu anda bakım modundadır. Lütfen daha sonra tekrar deneyin.'}
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SeoHead siteSettings={siteQuery.data} />
      <PublicHeader siteSettings={siteQuery.data} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Outlet context={{ siteSettings: siteQuery.data, companySettings: companyQuery.data }} />
      </main>
      <PublicFooter companySettings={companyQuery.data} />
    </div>
  );
}
