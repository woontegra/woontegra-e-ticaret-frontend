import { Link, useLocation, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPublicPage } from '@/shared/api/pages.api';
import { uiLabel } from '@/shared/lib/storefront-ui';
import { SeoHead } from '@/storefront/components/SeoHead';
import { ArticleSkeleton } from '@/storefront/components/StorefrontSkeletons';
import { usePageSeo } from '@/storefront/hooks/usePageSeo';
import { useStorefrontUi } from '@/storefront/hooks/useStorefrontUi';
import {
  buildCanonicalUrl,
  resolveOgImageUrl,
  resolveSeoDescription,
  resolveSeoTitle,
} from '@/shared/lib/seo-meta';
import { usePublicSiteSettings } from '@/storefront/hooks/usePublicSettings';
import { LazyImage } from '@/shared/ui/LazyImage';

export function PublicPageView() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const siteQuery = usePublicSiteSettings();
  const { seoSettings } = usePageSeo();
  const ui = useStorefrontUi();

  const pageQuery = useQuery({
    queryKey: ['public', 'pages', slug],
    queryFn: () => getPublicPage(slug!),
    enabled: Boolean(slug),
  });

  const notFoundTitle = uiLabel(ui, 'pageNotFoundTitle');
  const notFoundMessage = uiLabel(ui, 'pageNotFoundMessage');
  const homeLink = uiLabel(ui, 'pageNotFoundHomeLink');
  const backHomeLink = uiLabel(ui, 'notFoundHomeLink');

  if (pageQuery.isLoading) {
    return <ArticleSkeleton />;
  }

  if (pageQuery.isError || !pageQuery.data) {
    if (!notFoundTitle && !notFoundMessage && !homeLink) {
      return null;
    }

    return (
      <div className="mx-auto max-w-2xl text-center">
        {notFoundTitle ? (
          <h1 className="text-xl font-semibold text-slate-900">{notFoundTitle}</h1>
        ) : null}
        {notFoundMessage ? (
          <p className="mt-2 text-sm text-slate-600">{notFoundMessage}</p>
        ) : null}
        {homeLink ? (
          <p className="mt-4">
            <Link to="/" className="text-sm text-slate-600 hover:text-slate-900">
              {homeLink}
            </Link>
          </p>
        ) : null}
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
          <LazyImage
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

        {backHomeLink ? (
          <p className="mt-8 text-sm">
            <Link to="/" className="text-slate-600 hover:text-slate-900">
              {backHomeLink}
            </Link>
          </p>
        ) : null}
      </article>
    </>
  );
}
