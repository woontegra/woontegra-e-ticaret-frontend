import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPublicBlogPost } from '@/shared/api/blog.api';
import { SeoHead } from '@/storefront/components/SeoHead';
import { usePublicSiteSettings } from '@/storefront/hooks/usePublicSettings';
import { Badge } from '@/shared/ui';

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const siteQuery = usePublicSiteSettings();

  const postQuery = useQuery({
    queryKey: ['public', 'blog', 'posts', slug],
    queryFn: () => getPublicBlogPost(slug!),
    enabled: Boolean(slug),
  });

  if (postQuery.isLoading) {
    return <p className="text-sm text-slate-500">Yükleniyor…</p>;
  }

  if (postQuery.isError || !postQuery.data) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-xl font-semibold text-slate-900">Yazı bulunamadı</h1>
        <p className="mt-4">
          <Link to="/blog" className="text-sm text-slate-600 hover:text-slate-900">
            ← Bloga dön
          </Link>
        </p>
      </div>
    );
  }

  const post = postQuery.data;

  return (
    <>
      <SeoHead
        siteSettings={siteQuery.data}
        title={post.seoTitle || post.title}
        description={post.seoDescription || post.excerpt || undefined}
        ogImageUrl={post.ogImageUrl ?? post.coverImageUrl ?? undefined}
        robotsIndex={post.robotsIndex}
      />

      <article className="mx-auto max-w-3xl">
        {post.coverImageUrl ? (
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="mb-6 w-full rounded-lg object-cover"
          />
        ) : null}

        {post.category ? (
          <Badge className="mb-3">{post.category.name}</Badge>
        ) : null}

        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
          {post.title}
        </h1>

        <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
          {post.authorName ? <span>{post.authorName}</span> : null}
          {post.readingTime ? <span>{post.readingTime} dk okuma</span> : null}
          {post.publishedAt ? (
            <span>{new Date(post.publishedAt).toLocaleDateString('tr-TR')}</span>
          ) : null}
        </div>

        {post.excerpt ? (
          <p className="mt-4 text-lg text-slate-600">{post.excerpt}</p>
        ) : null}

        {post.tags.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <li key={tag}>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  {tag}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        <div
          className="prose prose-slate mt-8 max-w-none"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />

        <p className="mt-8 text-sm">
          <Link to="/blog" className="text-slate-600 hover:text-slate-900">
            ← Bloga dön
          </Link>
        </p>
      </article>
    </>
  );
}
