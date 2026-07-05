import { Link, useLocation, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPublicBlogPost, listPublicBlogPosts } from '@/shared/api/blog.api';
import { uiLabel } from '@/shared/lib/storefront-ui';
import { SeoHead } from '@/storefront/components/SeoHead';
import { ArticleSkeleton } from '@/storefront/components/StorefrontSkeletons';
import { BlogImageFallback } from '@/storefront/components/media/ImageFallback';
import { ProductDetailCrossLinks } from '@/storefront/components/product/ProductDetailSections';
import { usePageSeo } from '@/storefront/hooks/usePageSeo';
import { useStorefrontUi } from '@/storefront/hooks/useStorefrontUi';
import {
  buildCanonicalUrl,
  resolveOgImageUrl,
  resolveSeoDescription,
  resolveSeoTitle,
} from '@/shared/lib/seo-meta';
import { usePublicSiteSettings } from '@/storefront/hooks/usePublicSettings';
import { Badge } from '@/shared/ui';
import { LazyImage } from '@/shared/ui/LazyImage';

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const siteQuery = usePublicSiteSettings();
  const { seoSettings } = usePageSeo();
  const ui = useStorefrontUi();

  const notFoundMessage = uiLabel(ui, 'blogPostNotFoundMessage');
  const notFoundBackLink = uiLabel(ui, 'blogPostNotFoundBackLink');
  const backLink = uiLabel(ui, 'blogBackLink');
  const readingTimeSuffix = uiLabel(ui, 'readingTimeSuffix');

  const postQuery = useQuery({
    queryKey: ['public', 'blog', 'posts', slug],
    queryFn: () => getPublicBlogPost(slug!),
    enabled: Boolean(slug),
  });

  const relatedQuery = useQuery({
    queryKey: ['public', 'blog', 'posts', 'related', postQuery.data?.category?.slug],
    queryFn: () =>
      listPublicBlogPosts({
        limit: 4,
        category: postQuery.data?.category?.slug,
      }),
    enabled: Boolean(postQuery.data?.category?.slug),
  });

  if (postQuery.isLoading) {
    return <ArticleSkeleton />;
  }

  if (postQuery.isError || !postQuery.data) {
    if (!notFoundMessage && !notFoundBackLink) {
      return null;
    }

    return (
      <div className="mx-auto max-w-2xl text-center">
        {notFoundMessage ? (
          <h1 className="text-xl font-semibold text-slate-900">{notFoundMessage}</h1>
        ) : null}
        {notFoundBackLink ? (
          <p className="mt-4">
            <Link to="/blog" className="text-sm text-slate-600 hover:text-slate-900">
              {notFoundBackLink}
            </Link>
          </p>
        ) : null}
      </div>
    );
  }

  const post = postQuery.data;
  const relatedPosts =
    relatedQuery.data?.items.filter((item) => item.slug !== post.slug).slice(0, 3) ??
    [];
  const isShortContent = (post.readingTime ?? 99) <= 2;

  return (
    <>
      <SeoHead
        siteSettings={siteQuery.data}
        seoSettings={seoSettings}
        title={resolveSeoTitle(
          { seoTitle: post.seoTitle },
          seoSettings,
          siteQuery.data,
        )}
        description={resolveSeoDescription(
          { seoDescription: post.seoDescription },
          seoSettings,
          siteQuery.data,
        )}
        ogImageUrl={resolveOgImageUrl(
          { ogImageUrl: post.ogImageUrl },
          seoSettings,
          siteQuery.data,
          post.coverImageUrl,
        )}
        canonicalUrl={buildCanonicalUrl(
          null,
          location.pathname,
          seoSettings,
          siteQuery.data,
        )}
        robotsIndex={post.robotsIndex}
      />

      <article className="mx-auto max-w-3xl">
        {backLink ? (
          <Link to="/blog" className="text-sm text-theme-muted hover:underline">
            {backLink}
          </Link>
        ) : null}

        {post.coverImageUrl ? (
          <LazyImage
            src={post.coverImageUrl}
            alt={post.title}
            className="mt-4 w-full rounded-2xl object-cover shadow-sm"
          />
        ) : (
          <div className="mt-4 overflow-hidden rounded-2xl">
            <BlogImageFallback
              title={post.title}
              aspectClassName="aspect-[21/9] w-full"
            />
          </div>
        )}

        <header className="mt-8">
          {post.category ? (
            <Badge className="mb-3">{post.category.name}</Badge>
          ) : null}

          <h1 className="theme-heading text-2xl sm:text-4xl">{post.title}</h1>

          <div className="mt-4 flex flex-wrap gap-3 text-sm text-theme-muted">
            {post.authorName ? <span>{post.authorName}</span> : null}
            {post.readingTime && readingTimeSuffix ? (
              <span>
                {post.readingTime} {readingTimeSuffix}
              </span>
            ) : null}
            {post.publishedAt ? (
              <span>{new Date(post.publishedAt).toLocaleDateString('tr-TR')}</span>
            ) : null}
          </div>

          {post.excerpt ? (
            <p className="mt-5 text-lg leading-relaxed text-theme-muted">
              {post.excerpt}
            </p>
          ) : null}
        </header>

        {post.tags.length > 0 ? (
          <ul className="mt-5 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <li key={tag}>
                <span className="rounded-full bg-theme-surface px-2.5 py-0.5 text-xs text-theme-muted ring-1 ring-theme-border">
                  {tag}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        <div
          className="prose prose-slate mt-8 max-w-none rounded-xl border border-theme-border bg-white p-6 sm:p-8"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />

        {relatedPosts.length > 0 ? (
          <section className="mt-10">
            <h2 className="theme-heading text-lg">Benzer yazılar</h2>
            <ul className="mt-4 space-y-3">
              {relatedPosts.map((related) => (
                <li key={related.id}>
                  <Link
                    to={`/blog/${related.slug}`}
                    className="block rounded-lg border border-theme-border bg-white px-4 py-3 text-sm font-medium hover:bg-theme-surface"
                  >
                    {related.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {isShortContent ? <ProductDetailCrossLinks className="mt-10" /> : null}

        {backLink ? (
          <p className="mt-8 text-sm">
            <Link to="/blog" className="text-theme-muted hover:text-theme-text">
              {backLink}
            </Link>
          </p>
        ) : null}
      </article>
    </>
  );
}
