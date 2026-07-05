import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listPublicProductCategories } from '@/shared/api/products.api';
import type { PublicProductCategoryDto } from '@/shared/types/api';
import { parseBlockSettings } from '@/shared/lib/block-model';
import type { PublicPageBlockDto } from '@/shared/types/api';
import { BlockEmptyState } from '../BlockEmptyState';
import { BlockSectionWrapper } from '../BlockSectionWrapper';
import { SectionHeading } from '../SectionHeading';
import { CatalogGridSkeleton } from './CatalogGridSkeleton';

interface BlockComponentProps {
  block: PublicPageBlockDto;
}

export function CategoryGridBlock({ block }: BlockComponentProps) {
  const settings = parseBlockSettings(block.settings);
  const limit = settings.itemCount ?? 6;
  const columns = Math.min(settings.columns ?? 3, 6);

  const categoriesQuery = useQuery({
    queryKey: ['public', 'categories', { limit }],
    queryFn: () => listPublicProductCategories({ limit }),
    retry: false,
    staleTime: 60_000,
  });

  const categories: PublicProductCategoryDto[] = categoriesQuery.data ?? [];

  return (
    <BlockSectionWrapper block={block}>
      <SectionHeading block={block} />
      {categoriesQuery.isPending ? (
        <CatalogGridSkeleton columns={columns} count={Math.min(limit, 6)} />
      ) : categories.length === 0 ? (
        <BlockEmptyState messageKey="emptyCategories" />
      ) : (
        <div
          className="grid w-full gap-4"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          }}
        >
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/kategori/${category.slug}`}
              className="theme-card group overflow-hidden transition hover:opacity-95"
            >
              {category.imageUrl ? (
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="aspect-[4/3] w-full object-cover"
                />
              ) : (
                <div className="aspect-[4/3] bg-slate-100" />
              )}
              <div className="p-3">
                <h3 className="text-sm font-medium group-hover:underline">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </BlockSectionWrapper>
  );
}
