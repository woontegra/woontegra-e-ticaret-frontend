import { Link, useNavigate } from 'react-router-dom';
import type { PublicProductDto } from '@/shared/types/api';
import { getProductPublicPath } from '@/shared/api/products.api';
import {
  buildDownloadContactUrl,
  buildQuoteContactUrl,
  formatPublicProductPrice,
  getDeliveryModeBadge,
  getProductPrimaryAction,
  toProductActionSource,
} from '@/shared/lib/productDelivery';
import { uiLabel } from '@/shared/lib/storefront-ui';
import { Badge, Button } from '@/shared/ui';
import { LazyImage } from '@/shared/ui/LazyImage';
import { cn } from '@/shared/lib/cn';
import { useStorefrontUi } from '@/storefront/hooks/useStorefrontUi';
import { useCart } from '@/storefront/hooks/useCart';
import { ApiError } from '@/shared/api/client';
import { useState } from 'react';
import { ProductImageFallback } from '@/storefront/components/media/ImageFallback';

interface ProductCardProps {
  product: PublicProductDto;
  view?: 'grid' | 'list';
  showBadge?: boolean;
  showDeliveryBadge?: boolean;
}

export function ProductCard({
  product,
  view = 'grid',
  showBadge = true,
  showDeliveryBadge = false,
}: ProductCardProps) {
  const ui = useStorefrontUi();
  const navigate = useNavigate();
  const { addMutation } = useCart();
  const [addError, setAddError] = useState<string | null>(null);

  const href = getProductPublicPath(product);
  const priceLabel = formatPublicProductPrice(product);
  const isList = view === 'list';
  const action = getProductPrimaryAction(toProductActionSource(product));
  const deliveryBadge = getDeliveryModeBadge(product.deliveryMode);

  const badgeNew = uiLabel(ui, 'productBadgeNew');
  const badgeFeatured = uiLabel(ui, 'productBadgeFeatured');
  const badgeBestSellerLabel = uiLabel(ui, 'productBadgeBestSeller');
  const actionDetail = uiLabel(ui, 'productActionDetail');

  const showBadges =
    showBadge &&
    ((product.isNew && badgeNew) ||
      (product.isFeatured && badgeFeatured) ||
      (product.isBestSeller && badgeBestSellerLabel));

  const handlePrimaryAction = () => {
    setAddError(null);

    if (action.type === 'quote') {
      navigate(buildQuoteContactUrl(product.name));
      return;
    }

    if (action.type === 'download') {
      navigate(href);
      return;
    }

    if (action.type === 'add_to_cart' || action.type === 'subscribe') {
      addMutation.mutate(
        { productId: product.id, variantId: null, quantity: 1 },
        {
          onSuccess: () => navigate('/sepet'),
          onError: (error) =>
            setAddError(
              error instanceof ApiError ? error.message : 'Sepete eklenemedi',
            ),
        },
      );
    }
  };

  return (
    <article
      className={cn(
        'group theme-product-card theme-card overflow-hidden rounded-xl border border-theme-border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md',
        isList && 'flex flex-col sm:flex-row',
      )}
    >
      <Link
        to={href}
        className={cn('relative block shrink-0 overflow-hidden', isList && 'sm:w-48 lg:w-56')}
      >
        {product.imageUrl ? (
          <LazyImage
            src={product.imageUrl}
            alt={product.name}
            className="theme-product-card-image w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <ProductImageFallback
            title={product.name}
            deliveryMode={product.deliveryMode}
          />
        )}
        {showDeliveryBadge && deliveryBadge ? (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-slate-800 shadow-sm ring-1 ring-black/5">
            {deliveryBadge}
          </span>
        ) : null}
      </Link>

      <div className={cn('flex flex-1 flex-col p-4 sm:p-5', isList && 'justify-center')}>
        <div className="mb-2 flex flex-wrap gap-1">
          {showBadges ? (
            <>
              {product.isNew && badgeNew ? <Badge>{badgeNew}</Badge> : null}
              {product.isFeatured && badgeFeatured ? (
                <Badge>{badgeFeatured}</Badge>
              ) : null}
              {product.isBestSeller && badgeBestSellerLabel ? (
                <Badge>{badgeBestSellerLabel}</Badge>
              ) : null}
            </>
          ) : null}
        </div>

        <Link to={href}>
          <h2 className="theme-product-card-title theme-heading text-base font-semibold group-hover:underline sm:text-lg">
            {product.name}
          </h2>
        </Link>

        {product.shortDescription ? (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-theme-muted">
            {product.shortDescription}
          </p>
        ) : null}

        {product.brand ? (
          <p className="mt-1 text-xs text-theme-muted">{product.brand.name}</p>
        ) : null}

        {priceLabel ? (
          <p className="theme-product-card-price mt-3 text-base font-semibold text-theme-text">
            {priceLabel}
          </p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
          {action.type !== 'none' && action.label ? (
            <Button
              type="button"
              size="sm"
              onClick={handlePrimaryAction}
              isLoading={addMutation.isPending}
            >
              {action.label}
            </Button>
          ) : null}
          {actionDetail ? (
            <Link
              to={href}
              className="theme-btn-secondary inline-block rounded-md border border-theme-border px-3 py-1.5 text-xs font-medium text-theme-muted transition hover:text-theme-text"
            >
              {actionDetail}
            </Link>
          ) : null}
        </div>

        {addError ? (
          <p className="mt-2 text-xs text-red-600">{addError}</p>
        ) : null}
      </div>
    </article>
  );
}

export { buildDownloadContactUrl };
