import { Link } from 'react-router-dom';
import type { PublicProductDto } from '@/shared/types/api';
import { getProductPublicPath } from '@/shared/api/products.api';
import { Badge } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';

function formatPrice(value: number | null) {
  if (value === null) return null;
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(value);
}

interface ProductCardProps {
  product: PublicProductDto;
  view?: 'grid' | 'list';
  showBadge?: boolean;
}

export function ProductCard({
  product,
  view = 'grid',
  showBadge = true,
}: ProductCardProps) {
  const href = getProductPublicPath(product);
  const price = product.price ?? product.salePrice ?? product.basePrice;
  const isList = view === 'list';

  return (
    <article
      className={cn(
        'theme-product-card theme-card overflow-hidden transition hover:opacity-95',
        isList && 'flex flex-col sm:flex-row',
      )}
    >
      <Link
        to={href}
        className={cn('block shrink-0', isList && 'sm:w-48 lg:w-56')}
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="theme-product-card-image w-full object-cover"
          />
        ) : (
          <div className="theme-product-card-image w-full bg-slate-100" />
        )}
      </Link>

      <div className={cn('flex flex-1 flex-col p-4', isList && 'justify-center')}>
        {showBadge ? (
          <div className="mb-2 flex flex-wrap gap-1">
            {product.isNew ? <Badge>Yeni</Badge> : null}
            {product.isFeatured ? <Badge>Öne çıkan</Badge> : null}
            {product.isBestSeller ? <Badge>Çok satan</Badge> : null}
          </div>
        ) : null}

        <Link to={href}>
          <h2 className="theme-product-card-title theme-heading group-hover:underline">
            {product.name}
          </h2>
        </Link>

        {product.shortDescription ? (
          <p className="mt-1 line-clamp-2 text-sm text-theme-muted">
            {product.shortDescription}
          </p>
        ) : null}

        {product.brand ? (
          <p className="mt-1 text-xs text-theme-muted">{product.brand.name}</p>
        ) : null}

        {price !== null ? (
          <p className="theme-product-card-price mt-2 text-sm font-medium">
            {formatPrice(price)}
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            to={href}
            className="theme-btn-secondary inline-block rounded-md border border-slate-200 px-3 py-1.5 text-xs"
          >
            Detaya git
          </Link>
          {product.demoUrl ? (
            <a
              href={product.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="theme-btn-secondary inline-block rounded-md border border-slate-200 px-3 py-1.5 text-xs"
              onClick={(event) => event.stopPropagation()}
            >
              Demoyu Gör
            </a>
          ) : null}
          {product.purchaseUrl ? (
            <a
              href={product.purchaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="theme-btn-primary inline-block rounded-md px-3 py-1.5 text-xs"
              onClick={(event) => event.stopPropagation()}
            >
              Satın Al
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
