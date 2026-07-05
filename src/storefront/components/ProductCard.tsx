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
        'theme-product-card theme-card overflow-hidden transition hover:opacity-95',
        isList && 'flex flex-col sm:flex-row',
      )}
    >
      <Link
        to={href}
        className={cn('block shrink-0', isList && 'sm:w-48 lg:w-56')}
      >
        {product.imageUrl ? (
          <LazyImage
            src={product.imageUrl}
            alt={product.name}
            className="theme-product-card-image w-full object-cover"
          />
        ) : (
          <div className="theme-product-card-image w-full bg-slate-100" />
        )}
      </Link>

      <div className={cn('flex flex-1 flex-col p-4', isList && 'justify-center')}>
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
          {showDeliveryBadge && deliveryBadge ? (
            <Badge>{deliveryBadge}</Badge>
          ) : null}
        </div>

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

        {priceLabel ? (
          <p className="theme-product-card-price mt-2 text-sm font-medium">
            {priceLabel}
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-2">
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
              className="theme-btn-secondary inline-block rounded-md border border-slate-200 px-3 py-1.5 text-xs"
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
