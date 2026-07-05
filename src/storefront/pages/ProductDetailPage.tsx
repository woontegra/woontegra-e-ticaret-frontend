import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import type { CartItemDto, PublicProductVariantDto } from '@/shared/types/api';
import {
  getProductPublicPath,
  getProductsIndexPath,
  getPublicProduct,
} from '@/shared/api/products.api';
import { SeoHead } from '@/storefront/components/SeoHead';
import { ProductAttributesTable } from '@/storefront/components/ProductAttributesTable';
import { ProductReviewsSection } from '@/storefront/components/ProductReviewsSection';
import { CartAddedModal } from '@/storefront/components/CartAddedModal';
import {
  getVariantDisplayImage,
  getVariantDisplayPrice,
  ProductVariantSelector,
} from '@/storefront/components/ProductVariantSelector';
import { usePublicSiteSettings } from '@/storefront/hooks/usePublicSettings';
import { usePageSeo } from '@/storefront/hooks/usePageSeo';
import {
  buildCanonicalUrl,
  resolveOgImageUrl,
  resolveSeoDescription,
} from '@/shared/lib/seo-meta';
import {
  buildQuoteContactUrl,
  canAddProductToCart,
  formatPublicProductPrice,
  getDeliveryModeBadge,
  getProductDeliveryHint,
  getProductPrimaryAction,
  toProductActionSource,
} from '@/shared/lib/productDelivery';
import { ApiError } from '@/shared/api/client';
import { uiLabel } from '@/shared/lib/storefront-ui';
import { useCart } from '@/storefront/hooks/useCart';
import { useStorefrontUi } from '@/storefront/hooks/useStorefrontUi';
import { Badge, Button } from '@/shared/ui';

function buildFreeDownloadHref(productSlug: string, fileType?: string | null) {
  const type = fileType === 'setup' || fileType === 'portable' ? fileType : 'other';
  return `/api/downloads/free/${encodeURIComponent(productSlug)}/${encodeURIComponent(type)}`;
}

interface ProductDetailPageProps {
  productKind?: 'SOFTWARE' | 'PHYSICAL';
}

export function ProductDetailPage({ productKind }: ProductDetailPageProps = {}) {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const siteQuery = usePublicSiteSettings();
  const { seoSettings } = usePageSeo();
  const ui = useStorefrontUi();
  const { addMutation, itemCount } = useCart();
  const [selectedVariant, setSelectedVariant] =
    useState<PublicProductVariantDto | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedItem, setAddedItem] = useState<CartItemDto | null>(null);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const productQuery = useQuery({
    queryKey: ['public', 'products', slug],
    queryFn: () => getPublicProduct(slug!),
    enabled: Boolean(slug),
  });

  const product = productQuery.data;

  const defaultVariant = useMemo(
    () => product?.variants[0] ?? null,
    [product?.variants],
  );

  const activeVariant = selectedVariant ?? defaultVariant;

  const variantPrice = getVariantDisplayPrice(
    activeVariant,
    product?.price ?? product?.salePrice ?? product?.basePrice ?? null,
  );
  const displayImage = getVariantDisplayImage(
    activeVariant,
    product?.imageUrl ?? null,
  );
  const listPath = getProductsIndexPath(product?.productKind);
  const hasVariants = (product?.variants.length ?? 0) > 0;
  const canAddToCart =
    product &&
    canAddProductToCart(product) &&
    variantPrice !== null &&
    (!hasVariants || activeVariant !== null);

  const primaryAction = product
    ? getProductPrimaryAction(toProductActionSource(product))
    : { type: 'none' as const, label: '' };

  const deliveryHint = product ? getProductDeliveryHint(product) : null;
  const deliveryBadge = product
    ? getDeliveryModeBadge(product.deliveryMode)
    : null;
  const priceLabel = product ? formatPublicProductPrice(product) : null;

  const badgeNew = uiLabel(ui, 'productBadgeNew');
  const badgeFeatured = uiLabel(ui, 'productBadgeFeatured');
  const badgeBestSeller = uiLabel(ui, 'productBadgeBestSeller');
  const actionDemo = uiLabel(ui, 'productActionDemo');
  const addToCartPending = uiLabel(ui, 'productAddToCartPending');
  const addToCartErrorLabel = uiLabel(ui, 'productAddToCartError');
  const quantityLabel = uiLabel(ui, 'productQuantityLabel');

  const pageTitle =
    product?.seoTitle?.trim() ||
    (siteQuery.data?.siteName
      ? `${product?.name ?? ''} | ${siteQuery.data.siteName}`
      : product?.name ?? '');

  const pageDescription =
    product?.seoDescription?.trim() ||
    product?.shortDescription?.trim() ||
    undefined;

  const handlePrimaryAction = () => {
    if (!product) return;
    setAddError(null);

    if (primaryAction.type === 'quote') {
      navigate(buildQuoteContactUrl(product.name));
      return;
    }

    if (primaryAction.type === 'download') {
      document.getElementById('product-downloads')?.scrollIntoView({
        behavior: 'smooth',
      });
      return;
    }

    if (
      (primaryAction.type === 'add_to_cart' ||
        primaryAction.type === 'subscribe') &&
      canAddToCart
    ) {
      addMutation.mutate(
        {
          productId: product.id,
          variantId: activeVariant?.id ?? null,
          quantity,
        },
        {
          onSuccess: (cart) => {
            const added = cart.items.find(
              (item) =>
                item.productId === product.id &&
                (item.variantId ?? null) === (activeVariant?.id ?? null),
            );
            setAddedItem(added ?? cart.items[cart.items.length - 1] ?? null);
            setCartModalOpen(true);
          },
          onError: (error) => {
            setAddError(
              error instanceof ApiError
                ? error.message
                : addToCartErrorLabel ?? '',
            );
          },
        },
      );
    }
  };

  if (productQuery.isPending) {
    return (
      <div className="mx-auto max-w-5xl animate-pulse space-y-6">
        <div className="h-8 w-1/2 rounded bg-slate-100" />
        <div className="aspect-[16/9] rounded-lg bg-slate-100" />
        <div className="h-4 w-full rounded bg-slate-100" />
        <div className="h-4 w-5/6 rounded bg-slate-100" />
      </div>
    );
  }

  if (productQuery.isError || !product) {
    const productNotFound = uiLabel(ui, 'productNotFound');
    const listBackLink = uiLabel(ui, 'productListBackLink');

    if (!productNotFound && !listBackLink) {
      return null;
    }

    return (
      <div className="mx-auto max-w-3xl py-16 text-center">
        {productNotFound ? (
          <p className="text-sm text-theme-muted">{productNotFound}</p>
        ) : null}
        {listBackLink ? (
          <Link to={listPath} className="mt-4 inline-block text-sm hover:underline">
            {listBackLink}
          </Link>
        ) : null}
      </div>
    );
  }

  const downloadFiles = product.downloadFiles?.files ?? [];

  return (
    <>
      <SeoHead
        siteSettings={siteQuery.data}
        seoSettings={seoSettings}
        title={pageTitle}
        description={resolveSeoDescription(
          { seoDescription: pageDescription ?? null },
          seoSettings,
          siteQuery.data,
        )}
        ogImageUrl={resolveOgImageUrl(
          { ogImageUrl: product.ogImageUrl },
          seoSettings,
          siteQuery.data,
          product.imageUrl,
        )}
        canonicalUrl={buildCanonicalUrl(
          product.canonicalUrl,
          productKind === 'SOFTWARE' || product.productKind === 'SOFTWARE'
            ? `/yazilimlar/${product.slug}`
            : location.pathname,
          seoSettings,
          siteQuery.data,
        )}
        robotsIndex={product.robotsIndex}
      />

      <div className="mx-auto max-w-5xl">
        {uiLabel(ui, 'productBackLink') ? (
          <Link to={listPath} className="text-sm text-theme-muted hover:underline">
            {uiLabel(ui, 'productBackLink')}
          </Link>
        ) : null}

        <div className="mt-4 grid gap-8 lg:grid-cols-2">
          <div>
            {displayImage ? (
              <img
                src={displayImage}
                alt={product.name}
                className="w-full rounded-lg object-cover"
              />
            ) : (
              <div className="aspect-square rounded-lg bg-slate-100" />
            )}
            {product.galleryImageUrls.length > 0 ? (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {product.galleryImageUrls.map((url) => (
                  <img
                    key={url}
                    src={url}
                    alt=""
                    className="aspect-square rounded-md object-cover"
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div>
            <div className="flex flex-wrap gap-2">
              {product.isNew && badgeNew ? <Badge>{badgeNew}</Badge> : null}
              {product.isFeatured && badgeFeatured ? (
                <Badge>{badgeFeatured}</Badge>
              ) : null}
              {product.isBestSeller && badgeBestSeller ? (
                <Badge>{badgeBestSeller}</Badge>
              ) : null}
              {deliveryBadge ? <Badge>{deliveryBadge}</Badge> : null}
            </div>

            <h1 className="theme-heading mt-3 text-2xl sm:text-3xl">
              {product.name}
            </h1>

            {product.version ? (
              <p className="mt-1 text-sm text-theme-muted">
                Sürüm {product.version}
              </p>
            ) : null}

            {product.shortDescription ? (
              <p className="mt-2 text-theme-muted">{product.shortDescription}</p>
            ) : null}

            {deliveryHint ? (
              <p className="mt-3 text-sm text-slate-600">{deliveryHint}</p>
            ) : null}

            {priceLabel ? (
              <p className="mt-4 text-xl font-semibold">{priceLabel}</p>
            ) : null}

            {product.featureBullets.length > 0 ? (
              <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-theme-muted">
                {product.featureBullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}

            <ProductVariantSelector
              variantAttributes={product.variantAttributes}
              variants={product.variants}
              onVariantChange={setSelectedVariant}
            />

            {product.category ? (
              <p className="mt-2 text-sm text-theme-muted">
                <Link
                  to={`/kategori/${product.category.slug}`}
                  className="hover:underline"
                >
                  {product.category.name}
                </Link>
              </p>
            ) : null}

            {product.brand ? (
              <p className="mt-1 text-sm text-theme-muted">
                <Link
                  to={`/marka/${product.brand.slug}`}
                  className="hover:underline"
                >
                  {product.brand.name}
                </Link>
              </p>
            ) : null}

            {primaryAction.type !== 'none' && primaryAction.label ? (
              <div className="mt-6 space-y-3">
                {(primaryAction.type === 'add_to_cart' ||
                  primaryAction.type === 'subscribe') &&
                canAddToCart ? (
                  <div className="flex items-center gap-3">
                    {quantityLabel ? (
                      <label className="text-sm text-slate-600">
                        {quantityLabel}
                        <input
                          type="number"
                          min={1}
                          max={99}
                          value={quantity}
                          onChange={(event) =>
                            setQuantity(
                              Math.max(1, Number(event.target.value) || 1),
                            )
                          }
                          className="ml-2 w-20 rounded-md border border-slate-200 px-2 py-1.5 text-sm"
                        />
                      </label>
                    ) : null}
                    <Button
                      onClick={handlePrimaryAction}
                      disabled={addMutation.isPending}
                    >
                      {addMutation.isPending && addToCartPending
                        ? addToCartPending
                        : primaryAction.label}
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handlePrimaryAction}
                    disabled={addMutation.isPending}
                  >
                    {primaryAction.label}
                  </Button>
                )}
                {addError ? (
                  <p className="text-sm text-red-600">{addError}</p>
                ) : null}
              </div>
            ) : null}

            {product.deliveryMode === 'FREE_DOWNLOAD' ? (
              <div id="product-downloads" className="mt-6 space-y-2">
                <p className="text-sm font-medium text-slate-800">
                  İndirilebilir dosyalar
                </p>
                {downloadFiles.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {downloadFiles.map((file, index) => {
                      const href = slug
                        ? buildFreeDownloadHref(slug, file.type)
                        : '#';
                      const isAvailable = file.available !== false && Boolean(file.type);

                      return isAvailable ? (
                        <a
                          key={`${file.label}-${index}`}
                          href={href}
                          className="theme-btn-secondary inline-flex items-center rounded-md border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
                        >
                          {file.buttonLabel || file.label}
                        </a>
                      ) : (
                        <Button
                          key={`${file.label}-${index}`}
                          type="button"
                          variant="secondary"
                          disabled
                          title="İndirme dosyası yakında eklenecek"
                        >
                          {file.buttonLabel || file.label}
                        </Button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-theme-muted">
                    İndirme dosyası yakında eklenecek.
                  </p>
                )}
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-2">
              {product.demoUrl && actionDemo ? (
                <a
                  href={product.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="theme-btn-secondary inline-block rounded-md border border-slate-200 px-3 py-2 text-sm"
                >
                  {actionDemo}
                </a>
              ) : null}
            </div>

            {product.tags.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-1">
                {product.tags.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {product.descriptionHtml ? (
          <div
            className="prose prose-slate mt-10 max-w-none"
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
          />
        ) : null}

        <ProductAttributesTable attributes={product.attributes} />

        {slug ? <ProductReviewsSection productSlug={slug} /> : null}
      </div>

      <CartAddedModal
        isOpen={cartModalOpen}
        onClose={() => setCartModalOpen(false)}
        item={addedItem}
        itemCount={itemCount}
      />
    </>
  );
}

export function getProductDetailCanonical(product: {
  slug: string;
  productKind: import('@/shared/types/api').ProductKind;
}) {
  return getProductPublicPath(product);
}
