import { Link } from 'react-router-dom';
import type { PublicProductDto } from '@/shared/types/api';
import { getProductPublicPath } from '@/shared/api/products.api';
import {
  formatPublicProductPrice,
  getDeliveryModeBadge,
} from '@/shared/lib/productDelivery';
import type { ProductCardStyle } from '@/shared/lib/block-variants';
import { ProductImageFallback } from '@/storefront/components/media/ImageFallback';
import { cn } from '@/shared/lib/cn';

interface ProductBlockCardProps {
  product: PublicProductDto;
  cardStyle?: ProductCardStyle;
  showPrice?: boolean;
  showBadge?: boolean;
  showDescription?: boolean;
  showCta?: boolean;
  compact?: boolean;
  className?: string;
}

export function ProductBlockCard({
  product,
  cardStyle = 'PREMIUM',
  showPrice = true,
  showBadge = true,
  showDescription = true,
  showCta = true,
  compact = false,
  className,
}: ProductBlockCardProps) {
  const href = getProductPublicPath(product);
  const price = formatPublicProductPrice(product);
  const badge = getDeliveryModeBadge(product.deliveryMode);

  const shellClass = cn(
    'group overflow-hidden transition',
    cardStyle === 'PREMIUM'
      ? 'rounded-xl border border-theme-border bg-white shadow-sm hover:-translate-y-0.5 hover:shadow-md'
      : cardStyle === 'COMPACT'
        ? 'rounded-lg border border-theme-border bg-white'
        : 'rounded-md border border-theme-border bg-white',
    compact ? 'flex gap-3 p-3' : '',
    className,
  );

  const imageWrap = (
    <div className={cn('relative shrink-0 overflow-hidden', compact ? 'w-24' : 'w-full')}>
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          className={cn(
            'object-cover transition duration-300 group-hover:scale-[1.02]',
            compact ? 'aspect-square w-24 rounded-md' : 'aspect-[4/3] w-full',
          )}
        />
      ) : (
        <ProductImageFallback
          title={product.name}
          deliveryMode={product.deliveryMode}
          aspectClassName={compact ? 'aspect-square w-24 rounded-md' : 'aspect-[4/3] w-full'}
        />
      )}
      {showBadge && badge && !compact ? (
        <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-slate-800 shadow-sm">
          {badge}
        </span>
      ) : null}
    </div>
  );

  const body = (
    <div className={cn(compact ? 'min-w-0 flex-1' : 'p-4')}>
      <Link to={href}>
        <h3
          className={cn(
            'font-semibold group-hover:underline',
            compact ? 'text-sm' : 'text-base',
          )}
        >
          {product.name}
        </h3>
      </Link>
      {showDescription && product.shortDescription ? (
        <p className="mt-1 line-clamp-2 text-xs text-theme-muted sm:text-sm">
          {product.shortDescription}
        </p>
      ) : null}
      {showPrice && price ? (
        <p className="mt-2 text-sm font-semibold">{price}</p>
      ) : null}
      {showCta ? (
        <Link
          to={href}
          className="mt-2 inline-block text-xs font-medium text-slate-900 hover:underline"
        >
          Detayları incele
        </Link>
      ) : null}
    </div>
  );

  return (
    <article className={shellClass}>
      {imageWrap}
      {body}
    </article>
  );
}
