import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { listPublicBlogPosts } from '@/shared/api/blog.api';
import { SeoHead } from '@/storefront/components/SeoHead';
import { StorefrontPageHeading } from '@/storefront/components/StorefrontPageHeading';
import {
  BlogListSkeleton,
  PageHeadingSkeleton,
} from '@/storefront/components/StorefrontSkeletons';
import { useOptionalPublicPage } from '@/storefront/hooks/useOptionalPublicPage';
import { usePageSeo } from '@/storefront/hooks/usePageSeo';
import {
  buildCanonicalUrl,
  resolveSeoDescription,
  resolveSeoTitle,
} from '@/shared/lib/seo-meta';
import { usePublicSiteSettings } from '@/storefront/hooks/usePublicSettings';
import { uiLabel } from '@/shared/lib/storefront-ui';
import { useStorefrontUi } from '@/storefront/hooks/useStorefrontUi';
import { Badge, Pagination } from '@/shared/ui';
import { LazyImage } from '@/shared/ui/LazyImage';

const PAGE_SIZE = 12;

export function BlogIndexPage() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);

  const siteQuery = usePublicSiteSettings();
  const { seoSettings } = usePageSeo();
  const cmsQuery = useOptionalPublicPage('blog');
  const cmsPage = cmsQuery.data;
  const ui = useStorefrontUi();
  const emptyMessage = uiLabel(ui, 'blogIndexEmpty');
  const readingTimeSuffix = uiLabel(ui, 'readingTimeSuffix');

  const postsQuery = useQuery({
    queryKey: ['public', 'blog', 'posts', { page, limit: PAGE_SIZE }],
    queryFn: () => listPublicBlogPosts({ page, limit: PAGE_SIZE }),
    placeholderData: (previous) => previous,
  });

  const totalPages = useMemo(() => {
    const total = postsQuery.data?.total ?? 0;
    return Math.max(1, Math.ceil(total / PAGE_SIZE));
  }, [postsQuery.data?.total]);

  const showHeadingSkeleton = cmsQuery.isLoading && !cmsPage;

  return (
    <>
      <SeoHead
        siteSettings={siteQuery.data}
        seoSettings={seoSettings}
        title={resolveSeoTitle(
          cmsPage
            ? {
                seoTitle: cmsPage.seoTitle,
                seoDescription: cmsPage.seoDescription,
              }
            : undefined,
          seoSettings,
          siteQuery.data,
        )}
        description={resolveSeoDescription(
          cmsPage ? { seoDescription: cmsPage.seoDescription } : undefined,
          seoSettings,
          siteQuery.data,
        )}
        canonicalUrl={buildCanonicalUrl(
          cmsPage?.canonicalUrl,
          location.pathname + location.search,
          seoSettings,
          siteQuery.data,
        )}
        robotsIndex={cmsPage?.robotsIndex ?? true}
      />

      <div className="mx-auto max-w-5xl">
        {showHeadingSkeleton ? (
          <PageHeadingSkeleton />
        ) : (
          <StorefrontPageHeading
            cmsPage={cmsPage}
            seoSettings={seoSettings}
            siteSettings={siteQuery.data}
          />
        )}

        {postsQuery.isLoading && !postsQuery.data ? (
          <BlogListSkeleton />
        ) : (postsQuery.data?.items.length ?? 0) === 0 ? (
          emptyMessage ? (
            <p className="mt-8 text-sm text-theme-muted">{emptyMessage}</p>
          ) : null
        ) : (
          <>
            <ul className="mt-8 grid gap-6 sm:grid-cols-2">
              {postsQuery.data!.items.map((post) => (
                <li key={post.id}>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="theme-card group block overflow-hidden transition hover:opacity-95"
                  >
                    {post.coverImageUrl ? (
                      <LazyImage
                        src={post.coverImageUrl}
                        alt={post.title}
                        className="aspect-[16/9] w-full object-cover"
                      />
                    ) : (
                      <div className="aspect-[16/9] bg-slate-100" />
                    )}
                    <div className="p-4">
                      {post.category ? (
                        <Badge className="mb-2">{post.category.name}</Badge>
                      ) : null}
                      <h2 className="theme-heading text-lg group-hover:underline">
                        {post.title}
                      </h2>
                      {post.excerpt ? (
                        <p className="mt-2 line-clamp-2 text-sm text-theme-muted">
                          {post.excerpt}
                        </p>
                      ) : null}
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                        {post.authorName ? <span>{post.authorName}</span> : null}
                        {post.readingTime && readingTimeSuffix ? (
                          <span>
                            {post.readingTime} {readingTimeSuffix}
                          </span>
                        ) : null}
                        {post.publishedAt ? (
                          <span>
                            {new Date(post.publishedAt).toLocaleDateString('tr-TR')}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            {totalPages > 1 ? (
              <div className="mt-10 flex justify-center">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={(nextPage) => {
                    const params = new URLSearchParams(searchParams);
                    if (nextPage <= 1) {
                      params.delete('page');
                    } else {
                      params.set('page', String(nextPage));
                    }
                    setSearchParams(params, { replace: true });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            ) : null}
          </>
        )}
      </div>
    </>
  );
}
