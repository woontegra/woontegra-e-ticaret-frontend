import { Link, useLocation, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPublicPage } from '@/shared/api/pages.api';
import { SeoHead } from '@/storefront/components/SeoHead';
import { usePageSeo } from '@/storefront/hooks/usePageSeo';
import {
  buildCanonicalUrl,
  resolveOgImageUrl,
  resolveSeoDescription,
  resolveSeoTitle,
} from '@/shared/lib/seo-meta';
import { usePublicSiteSettings } from '@/storefront/hooks/usePublicSettings';

export function PublicPageView() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const siteQuery = usePublicSiteSettings();
  const { seoSettings } = usePageSeo();

  const pageQuery = useQuery({
    queryKey: ['public', 'pages', slug],
    queryFn: () => getPublicPage(slug!),
    enabled: Boolean(slug),
  });

  if (pageQuery.isLoading) {
    return <p className="text-sm text-slate-500">Yükleniyor…</p>;
  }

  if (pageQuery.isError || !pageQuery.data) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-xl font-semibold text-slate-900">Sayfa bulunamadı</h1>
        <p className="mt-2 text-sm text-slate-600">
          Aradığınız sayfa mevcut değil veya yayından kaldırılmış olabilir.
        </p>
        <p className="mt-4">
          <Link to="/" className="text-sm text-slate-600 hover:text-slate-900">
            ← Ana sayfaya dön
          </Link>
        </p>
      </div>
    );
  }

  const page = pageQuery.data;

  return (
    <>
      <SeoHead
        siteSettings={siteQuery.data}
        seoSettings={seoSettings}
        title={resolveSeoTitle(
          { seoTitle: page.seoTitle },
          seoSettings,
          siteQuery.data,
        )}
        description={resolveSeoDescription(
          { seoDescription: page.seoDescription },
          seoSettings,
          siteQuery.data,
        )}
        ogImageUrl={resolveOgImageUrl(
          { ogImageUrl: page.ogImageUrl },
          seoSettings,
          siteQuery.data,
          page.featuredImageUrl,
        )}
        canonicalUrl={buildCanonicalUrl(
          page.canonicalUrl,
          location.pathname,
          seoSettings,
          siteQuery.data,
        )}
        robotsIndex={page.robotsIndex}
      />

      <article className="mx-auto max-w-3xl">
        {page.featuredImageUrl ? (
          <img
            src={page.featuredImageUrl}
            alt={page.title}
            className="mb-6 w-full rounded-lg object-cover"
          />
        ) : null}

        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
          {page.title}
        </h1>

        {page.excerpt ? (
          <p className="mt-2 text-slate-600">{page.excerpt}</p>
        ) : null}

        <div
          className="prose prose-slate mt-8 max-w-none"
          dangerouslySetInnerHTML={{ __html: page.contentHtml }}
        />

        <p className="mt-8 text-sm">
          <Link to="/" className="text-slate-600 hover:text-slate-900">
            ← Ana sayfaya dön
          </Link>
        </p>
      </article>
    </>
  );
}
