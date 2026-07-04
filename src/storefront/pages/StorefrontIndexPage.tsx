import { Link } from 'react-router-dom';
import { SeoHead } from '@/storefront/components/SeoHead';
import { usePublicSiteSettings } from '@/storefront/hooks/usePublicSettings';

/**
 * Storefront ana sayfa — CMS blokları ileride eklenecek.
 */
export function StorefrontIndexPage() {
  const siteQuery = usePublicSiteSettings();

  return (
    <>
      <SeoHead siteSettings={siteQuery.data} />
      <div className="w-full">
        {siteQuery.data?.siteName ? (
          <h1 className="text-2xl font-semibold text-slate-900">
            {siteQuery.data.siteName}
          </h1>
        ) : null}
        {siteQuery.data?.siteDescription ? (
          <p className="mt-2 max-w-2xl text-slate-600">
            {siteQuery.data.siteDescription}
          </p>
        ) : null}

        <div className="mt-8 min-h-[200px] rounded-lg border border-dashed border-slate-200 bg-slate-50" />

        <p className="mt-6 text-sm">
          <Link to="/iletisim" className="text-slate-600 hover:text-slate-900">
            İletişim →
          </Link>
        </p>
      </div>
    </>
  );
}
