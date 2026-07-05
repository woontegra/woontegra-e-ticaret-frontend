import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listPublicBlogPosts } from '@/shared/api/blog.api';
import { parseBlockSettings } from '@/shared/lib/block-model';
import type { PublicPageBlockDto } from '@/shared/types/api';
import { Badge } from '@/shared/ui';
import { BlockEmptyState } from '../BlockEmptyState';
import { BlockSectionWrapper } from '../BlockSectionWrapper';
import { SectionHeading } from '../SectionHeading';
import { CatalogGridSkeleton } from './CatalogGridSkeleton';

interface BlockComponentProps {
  block: PublicPageBlockDto;
}

export function BlogGridBlock({ block }: BlockComponentProps) {
  const settings = parseBlockSettings(block.settings);
  const limit = settings.itemCount ?? 3;
  const columns = Math.min(settings.columns ?? 3, 4);

  const postsQuery = useQuery({
    queryKey: ['public', 'blog', 'posts', { limit }],
    queryFn: () => listPublicBlogPosts({ limit }),
    staleTime: 60_000,
  });

  const posts = postsQuery.data?.items ?? [];

  return (
    <BlockSectionWrapper block={block}>
      <SectionHeading block={block} />
      {postsQuery.isPending ? (
        <CatalogGridSkeleton columns={columns} count={Math.min(limit, 4)} />
      ) : posts.length === 0 ? (
        <BlockEmptyState message="Henüz yayınlanmış blog yazısı yok." />
      ) : (
        <div
          className="grid w-full gap-4"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          }}
        >
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="theme-card group overflow-hidden transition hover:opacity-95"
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
                <h3 className="theme-heading text-base group-hover:underline">
                  {post.title}
                </h3>
                {post.excerpt ? (
                  <p className="mt-2 line-clamp-2 text-sm text-theme-muted">
                    {post.excerpt}
                  </p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </BlockSectionWrapper>
  );
}
