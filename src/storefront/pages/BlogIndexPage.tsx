import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  listPublicBlogCategories,
  listPublicBlogPosts,
} from '@/shared/api/blog.api';
import { SeoHead } from '@/storefront/components/SeoHead';
import {
  BlogListSkeleton,
} from '@/storefront/components/StorefrontSkeletons';
import { BlogImageFallback } from '@/storefront/components/media/ImageFallback';
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
import { cn } from '@/shared/lib/cn';

const PAGE_SIZE = 12;

export function BlogIndexPage() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);
  const activeCategory = searchParams.get('category')?.trim() || '';

  const siteQuery = usePublicSiteSettings();
  const { seoSettings } = usePageSeo();
  const cmsQuery = useOptionalPublicPage('blog');
  const cmsPage = cmsQuery.data;
  const ui = useStorefrontUi();
  const emptyMessage = uiLabel(ui, 'blogIndexEmpty');
  const readingTimeSuffix = uiLabel(ui, 'readingTimeSuffix');

  const categoriesQuery = useQuery({
    queryKey: ['public', 'blog', 'categories'],
    queryFn: listPublicBlogCategories,
  });

  const postsQuery = useQuery({
    queryKey: [
      'public',
      'blog',
      'posts',
      { page, limit: PAGE_SIZE, category: activeCategory || undefined },
    ],
    queryFn: () =>
      listPublicBlogPosts({
        page,
        limit: PAGE_SIZE,
        category: activeCategory || undefined,
      }),
    placeholderData: (previous) => previous,
  });

  const totalPages = useMemo(() => {
    const total = postsQuery.data?.total ?? 0;
    return Math.max(1, Math.ceil(total / PAGE_SIZE));
  }, [postsQuery.data?.total]);

  const setCategory = (slug: string) => {
    const params = new URLSearchParams(searchParams);
    params.delete('page');
    if (slug) {
      params.set('category', slug);
    } else {
      params.delete('category');
    }
    setSearchParams(params, { replace: true });
  };

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
            : { seoTitle: 'Blog', seoDescription: 'Woontegra blog yazıları' },
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

      <div className="mx-auto max-w-6xl">
        <section className="overflow-hidden rounded-2xl border border-theme-border bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-10 text-white sm:px-10 sm:py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
            Woontegra Blog
          </p>
          <h1 className="theme-heading mt-2 text-2xl text-white sm:text-3xl">
            Yazılım, dijital dönüşüm ve teknoloji içerikleri
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
            Ürün geliştirme, SaaS, e-ticaret ve dijital pazarlama konularında
            güncel yazılar.
          </p>
        </section>

        {(categoriesQuery.data?.length ?? 0) > 0 ? (
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategory('')}
              className={cn(
                'rounded-full px-3 py-1.5 text-sm font-medium transition',
                !activeCategory
                  ? 'bg-slate-900 text-white'
                  : 'bg-theme-surface text-theme-muted hover:text-theme-text',
              )}
            >
              Tümü
            </button>
            {categoriesQuery.data!.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setCategory(category.slug)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-sm font-medium transition',
                  activeCategory === category.slug
                    ? 'bg-slate-900 text-white'
                    : 'bg-theme-surface text-theme-muted hover:text-theme-text',
                )}
              >
                {category.name}
              </button>
            ))}
          </div>
        ) : null}

        {postsQuery.isLoading && !postsQuery.data ? (
          <div className="mt-8">
            <BlogListSkeleton />
          </div>
        ) : (postsQuery.data?.items.length ?? 0) === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-theme-border bg-theme-surface px-6 py-12 text-center">
            {emptyMessage ? (
              <p className="text-sm text-theme-muted">{emptyMessage}</p>
            ) : (
              <p className="text-sm text-theme-muted">
                Bu kategoride henüz yayınlanmış yazı bulunmuyor.
              </p>
            )}
          </div>
        ) : (
          <>
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {postsQuery.data!.items.map((post) => (
                <li key={post.id}>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="theme-card group flex h-full flex-col overflow-hidden rounded-xl border border-theme-border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    {post.coverImageUrl ? (
                      <LazyImage
                        src={post.coverImageUrl}
                        alt={post.title}
                        className="aspect-[16/9] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <BlogImageFallback title={post.title} />
                    )}
                    <div className="flex flex-1 flex-col p-5">
                      {post.category ? (
                        <Badge className="mb-2 w-fit">{post.category.name}</Badge>
                      ) : null}
                      <h2 className="theme-heading text-lg font-semibold group-hover:underline">
                        {post.title}
                      </h2>
                      {post.excerpt ? (
                        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-theme-muted">
                          {post.excerpt}
                        </p>
                      ) : null}
                      <div className="mt-4 flex flex-wrap gap-2 text-xs text-theme-muted">
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
                      <span className="mt-3 text-sm font-medium text-slate-900 group-hover:underline">
                        Devamını oku →
                      </span>
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
