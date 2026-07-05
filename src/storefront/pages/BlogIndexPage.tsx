import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listPublicBlogPosts } from '@/shared/api/blog.api';
import { SeoHead } from '@/storefront/components/SeoHead';
import { usePublicSiteSettings } from '@/storefront/hooks/usePublicSettings';
import { Badge } from '@/shared/ui';

export function BlogIndexPage() {
  const siteQuery = usePublicSiteSettings();

  const postsQuery = useQuery({
    queryKey: ['public', 'blog', 'posts'],
    queryFn: () => listPublicBlogPosts(),
  });

  const siteName = siteQuery.data?.siteName;

  return (
    <>
      <SeoHead
        siteSettings={siteQuery.data}
        title={siteName ? `Blog | ${siteName}` : undefined}
      />

      <div className="mx-auto max-w-5xl">
        <h1 className="theme-heading text-2xl sm:text-3xl">Blog</h1>
        {siteQuery.data?.siteDescription ? (
          <p className="mt-2 text-theme-muted">{siteQuery.data.siteDescription}</p>
        ) : null}

        {postsQuery.isLoading ? (
          <p className="mt-8 text-sm text-theme-muted">Yükleniyor…</p>
        ) : (postsQuery.data?.items.length ?? 0) === 0 ? (
          <p className="mt-8 text-sm text-theme-muted">
            Henüz yayınlanmış blog yazısı yok.
          </p>
        ) : (
          <ul className="mt-8 grid gap-6 sm:grid-cols-2">
            {postsQuery.data!.items.map((post) => (
              <li key={post.id}>
                <Link
                  to={`/blog/${post.slug}`}
                  className="theme-card group block overflow-hidden transition hover:opacity-95"
                >
                  {post.coverImageUrl ? (
                    <img
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
                      {post.readingTime ? (
                        <span>{post.readingTime} dk okuma</span>
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
        )}
      </div>
    </>
  );
}
