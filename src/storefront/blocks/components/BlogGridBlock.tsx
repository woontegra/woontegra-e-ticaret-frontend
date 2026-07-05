import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listPublicBlogPosts } from '@/shared/api/blog.api';
import {
  getBlogDisplayMode,
  parseBlockSettings,
} from '@/shared/lib/block-model';
import type { PublicPageBlockDto } from '@/shared/types/api';
import { Badge } from '@/shared/ui';
import { LazyImage } from '@/shared/ui/LazyImage';
import { BlogImageFallback } from '@/storefront/components/media/ImageFallback';
import { BlockEmptyState } from '../BlockEmptyState';
import { BlockSectionWrapper } from '../BlockSectionWrapper';
import { SectionHeading } from '../SectionHeading';
import { CatalogGridSkeleton } from './CatalogGridSkeleton';
import { BlockCarousel } from './shared/BlockCarousel';
import { cn } from '@/shared/lib/cn';

interface BlockComponentProps {
  block: PublicPageBlockDto;
}

function BlogCard({
  post,
  settings,
  featured = false,
}: {
  post: Awaited<ReturnType<typeof listPublicBlogPosts>>['items'][number];
  settings: ReturnType<typeof parseBlockSettings>;
  featured?: boolean;
}) {
  const showCover = settings.showCover ?? true;
  const showExcerpt = settings.showExcerpt ?? true;
  const showDate = settings.showDate ?? true;
  const showCategory = settings.showCategory ?? true;

  return (
    <Link
      to={`/blog/${post.slug}`}
      className={cn(
        'theme-card group flex h-full flex-col overflow-hidden rounded-xl border border-theme-border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md',
        featured ? 'lg:flex-row' : '',
      )}
    >
      {showCover ? (
        post.coverImageUrl ? (
          <LazyImage
            src={post.coverImageUrl}
            alt={post.title}
            className={cn(
              'object-cover transition duration-300 group-hover:scale-[1.02]',
              featured
                ? 'aspect-[16/9] w-full lg:aspect-auto lg:w-1/2 lg:min-h-[280px]'
                : 'aspect-[16/9] w-full',
            )}
          />
        ) : (
          <BlogImageFallback
            title={post.title}
            aspectClassName={
              featured
                ? 'aspect-[16/9] w-full lg:aspect-auto lg:w-1/2 lg:min-h-[280px]'
                : 'aspect-[16/9] w-full'
            }
          />
        )
      ) : null}
      <div className="flex flex-1 flex-col p-5">
        {showCategory && post.category ? (
          <Badge className="mb-2 w-fit">{post.category.name}</Badge>
        ) : null}
        <h3 className="theme-heading text-lg font-semibold group-hover:underline">
          {post.title}
        </h3>
        {showExcerpt && post.excerpt ? (
          <p className="mt-2 line-clamp-3 flex-1 text-sm text-theme-muted">
            {post.excerpt}
          </p>
        ) : null}
        {showDate && post.publishedAt ? (
          <p className="mt-3 text-xs text-theme-muted">
            {new Date(post.publishedAt).toLocaleDateString('tr-TR')}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

export function BlogGridBlock({ block }: BlockComponentProps) {
  const settings = parseBlockSettings(block.settings);
  const displayMode = getBlogDisplayMode(block);
  const limit = settings.itemCount ?? 3;
  const columns = settings.columns ?? 3;
  const [activeIndex, setActiveIndex] = useState(0);
  const slider = settings.slider ?? {};

  const postsQuery = useQuery({
    queryKey: [
      'public',
      'blog',
      'posts',
      { limit, category: settings.blogCategorySlug, displayMode },
    ],
    queryFn: () =>
      listPublicBlogPosts({
        limit,
        category: settings.blogCategorySlug,
      }),
    staleTime: 60_000,
  });

  const posts = postsQuery.data?.items ?? [];
  const gridStyle = useMemo(
    () => ({
      gridTemplateColumns: `repeat(${Math.min(columns, 3)}, minmax(0, 1fr))`,
    }),
    [columns],
  );

  return (
    <BlockSectionWrapper block={block}>
      <SectionHeading block={block} />
      {postsQuery.isPending ? (
        <CatalogGridSkeleton columns={columns} count={Math.min(limit, 4)} />
      ) : posts.length === 0 ? (
        <BlockEmptyState messageKey="emptyBlog" />
      ) : displayMode === 'CAROUSEL' ? (
        <BlockCarousel
          itemCount={posts.length}
          activeIndex={activeIndex}
          onActiveIndexChange={setActiveIndex}
          autoplay={slider.autoplay ?? false}
          autoplayDelay={slider.autoplayDelay ?? 5000}
          showDots={slider.showDots ?? true}
          showArrows={slider.showArrows ?? true}
          transitionEffect={slider.transitionEffect ?? 'SLIDE'}
          loop={slider.loop ?? true}
          renderSlide={(index) => (
            <div className="px-2">
              <BlogCard post={posts[index]!} settings={settings} />
            </div>
          )}
        />
      ) : displayMode === 'FEATURED_POST_PLUS_GRID' ? (
        <div className="space-y-6">
          {posts[0] ? (
            <BlogCard post={posts[0]} settings={settings} featured />
          ) : null}
          <div className="grid gap-4" style={gridStyle}>
            {posts.slice(1).map((post) => (
              <BlogCard key={post.id} post={post} settings={settings} />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid w-full gap-4" style={gridStyle}>
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} settings={settings} />
          ))}
        </div>
      )}
    </BlockSectionWrapper>
  );
}
