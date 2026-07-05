import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  getProductPublicPath,
  listPublicProducts,
} from '@/shared/api/products.api';
import { parseBlockSettings } from '@/shared/lib/block-model';
import type { PublicPageBlockDto } from '@/shared/types/api';
import { BlockEmptyState } from '../BlockEmptyState';
import { BlockSectionWrapper } from '../BlockSectionWrapper';
import { SectionHeading } from '../SectionHeading';
import { CatalogGridSkeleton } from './CatalogGridSkeleton';

interface BlockComponentProps {
  block: PublicPageBlockDto;
}

function formatPrice(value: number | null) {
  if (value === null) return null;
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(value);
}

export function ProductCarouselBlock({ block }: BlockComponentProps) {
  const settings = parseBlockSettings(block.settings);
  const limit = settings.itemCount ?? 12;

  const productsQuery = useQuery({
    queryKey: ['public', 'products', { limit, carousel: true }],
    queryFn: () => listPublicProducts({ limit }),
    retry: false,
    staleTime: 60_000,
  });

  const products = productsQuery.data?.items ?? [];

  return (
    <BlockSectionWrapper block={block}>
      <SectionHeading block={block} />
      {productsQuery.isPending ? (
        <CatalogGridSkeleton columns={4} count={4} horizontal />
      ) : products.length === 0 ? (
        <BlockEmptyState messageKey="emptyProducts" />
      ) : (
        <div className="-mx-1 flex gap-4 overflow-x-auto pb-2">
          {products.map((product) => (
            <Link
              key={product.id}
              to={getProductPublicPath(product)}
              className="theme-card w-56 shrink-0 overflow-hidden transition hover:opacity-95"
            >
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <div className="aspect-square bg-slate-100" />
              )}
              <div className="p-3">
                <h3 className="truncate text-sm font-medium">{product.name}</h3>
                {formatPrice(product.price) ? (
                  <p className="mt-1 text-sm text-theme-muted">
                    {formatPrice(product.price)}
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
