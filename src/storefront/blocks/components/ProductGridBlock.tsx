import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ProductKind } from '@/shared/types/api';
import {
  getProductDisplayMode,
  parseBlockSettings,
} from '@/shared/lib/block-model';
import type { PublicPageBlockDto } from '@/shared/types/api';
import { listPublicProducts } from '@/shared/api/products.api';
import { BlockEmptyState } from '../BlockEmptyState';
import { BlockSectionWrapper } from '../BlockSectionWrapper';
import { SectionHeading } from '../SectionHeading';
import { CatalogGridSkeleton } from './CatalogGridSkeleton';
import { ProductBlockCard } from './shared/ProductBlockCard';
import { BlockCarousel } from './shared/BlockCarousel';
import { cn } from '@/shared/lib/cn';

interface BlockComponentProps {
  block: PublicPageBlockDto;
}

export function ProductGridBlock({ block }: BlockComponentProps) {
  const settings = parseBlockSettings(block.settings);
  const displayMode = getProductDisplayMode(block);
  const limit = settings.itemCount ?? 8;
  const productKind = settings.productKind as ProductKind | undefined;
  const featured = settings.source === 'FEATURED';
  const category = settings.categorySlug;

  const productsQuery = useQuery({
    queryKey: [
      'public',
      'products',
      { limit, productKind, featured, category, displayMode },
    ],
    queryFn: () =>
      listPublicProducts({
        limit,
        productKind,
        featured: featured || undefined,
        category,
        sort: featured ? 'featured' : 'newest',
      }),
    retry: false,
    staleTime: 60_000,
  });

  const products = productsQuery.data?.items ?? [];
  const columns = settings.columns ?? 3;
  const [activeIndex, setActiveIndex] = useState(0);
  const slider = settings.slider ?? {};

  const gridStyle = useMemo(
    () => ({
      gridTemplateColumns: `repeat(${Math.min(columns, 3)}, minmax(0, 1fr))`,
    }),
    [columns],
  );

  const cardProps = {
    cardStyle: settings.cardStyle,
    showPrice: settings.showPrice ?? true,
    showBadge: settings.showBadge ?? true,
    showDescription: settings.showDescription ?? true,
    showCta: settings.showCta ?? true,
  };

  return (
    <BlockSectionWrapper block={block}>
      <SectionHeading block={block} />
      {productsQuery.isPending ? (
        <CatalogGridSkeleton columns={columns} count={Math.min(limit, 6)} />
      ) : products.length === 0 ? (
        <BlockEmptyState messageKey="emptyProducts" />
      ) : displayMode === 'CAROUSEL' ? (
        <BlockCarousel
          itemCount={products.length}
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
              <ProductBlockCard product={products[index]!} {...cardProps} />
            </div>
          )}
        />
      ) : displayMode === 'FEATURED_ROW' ? (
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          {products[0] ? (
            <ProductBlockCard product={products[0]} {...cardProps} />
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            {products.slice(1, 5).map((product) => (
              <ProductBlockCard key={product.id} product={product} {...cardProps} />
            ))}
          </div>
        </div>
      ) : displayMode === 'COMPACT_LIST' ? (
        <div className="space-y-3">
          {products.map((product) => (
            <ProductBlockCard
              key={product.id}
              product={product}
              {...cardProps}
              compact
            />
          ))}
        </div>
      ) : (
        <div className={cn('grid w-full gap-4')} style={gridStyle}>
          {products.map((product) => (
            <ProductBlockCard key={product.id} product={product} {...cardProps} />
          ))}
        </div>
      )}
    </BlockSectionWrapper>
  );
}
