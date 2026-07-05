import { Link, useParams } from 'react-router-dom';
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
import { CartAddedModal } from '@/storefront/components/CartAddedModal';
import {
  getVariantDisplayImage,
  getVariantDisplayPrice,
  ProductVariantSelector,
} from '@/storefront/components/ProductVariantSelector';
import { usePublicSiteSettings } from '@/storefront/hooks/usePublicSettings';
import { ApiError } from '@/shared/api/client';
import { useCart } from '@/storefront/hooks/useCart';
import { Badge, Button } from '@/shared/ui';

function formatPrice(value: number | null) {
  if (value === null) return null;
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(value);
}

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const siteQuery = usePublicSiteSettings();
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

  const price = getVariantDisplayPrice(
    activeVariant,
    product?.price ?? product?.salePrice ?? product?.basePrice ?? null,
  );
  const displayImage = getVariantDisplayImage(
    activeVariant,
    product?.imageUrl ?? null,
  );
  const listPath = getProductsIndexPath(product?.productKind);
  const hasVariants = (product?.variants.length ?? 0) > 0;
  const canAddToCart = price !== null && (!hasVariants || activeVariant !== null);

  const handleAddToCart = () => {
    if (!product || !canAddToCart) return;

    setAddError(null);
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
            error instanceof ApiError ? error.message : 'Sepete eklenemedi.',
          );
        },
      },
    );
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
    return (
      <div className="mx-auto max-w-3xl py-16 text-center">
        <p className="text-sm text-theme-muted">Ürün bulunamadı.</p>
        <Link to={listPath} className="mt-4 inline-block text-sm hover:underline">
          ← Listeye dön
        </Link>
      </div>
    );
  }

  return (
    <>
      <SeoHead
        siteSettings={siteQuery.data}
        title={
          product.seoTitle ||
          (siteQuery.data?.siteName
            ? `${product.name} | ${siteQuery.data.siteName}`
            : product.name)
        }
        description={product.seoDescription || product.shortDescription || undefined}
        ogImageUrl={product.ogImageUrl || product.imageUrl || undefined}
        robotsIndex={product.robotsIndex}
      />

      <div className="mx-auto max-w-5xl">
        <Link to={listPath} className="text-sm text-theme-muted hover:underline">
          ← Geri
        </Link>

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
              {product.isNew ? <Badge>Yeni</Badge> : null}
              {product.isFeatured ? <Badge>Öne çıkan</Badge> : null}
              {product.isBestSeller ? <Badge>Çok satan</Badge> : null}
            </div>

            <h1 className="theme-heading mt-3 text-2xl sm:text-3xl">
              {product.name}
            </h1>

            {product.shortDescription ? (
              <p className="mt-2 text-theme-muted">{product.shortDescription}</p>
            ) : null}

            {price !== null ? (
              <p className="mt-4 text-xl font-semibold">{formatPrice(price)}</p>
            ) : null}

            <ProductVariantSelector
              variantAttributes={product.variantAttributes}
              variants={product.variants}
              onVariantChange={setSelectedVariant}
            />

            {product.category ? (
              <p className="mt-2 text-sm text-theme-muted">
                Kategori: {product.category.name}
              </p>
            ) : null}

            {canAddToCart ? (
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3">
                  <label className="text-sm text-slate-600">
                    Adet
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={quantity}
                      onChange={(event) =>
                        setQuantity(Math.max(1, Number(event.target.value) || 1))
                      }
                      className="ml-2 w-20 rounded-md border border-slate-200 px-2 py-1.5 text-sm"
                    />
                  </label>
                  <Button
                    onClick={handleAddToCart}
                    disabled={addMutation.isPending}
                  >
                    {addMutation.isPending ? 'Ekleniyor…' : 'Sepete ekle'}
                  </Button>
                </div>
                {addError ? (
                  <p className="text-sm text-red-600">{addError}</p>
                ) : null}
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-2">
              {product.demoUrl ? (
                <a
                  href={product.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="theme-btn-secondary inline-block rounded-md border border-slate-200 px-3 py-2 text-sm"
                >
                  Demo
                </a>
              ) : null}
              {product.purchaseUrl ? (
                <a
                  href={product.purchaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="theme-btn-primary inline-block rounded-md px-3 py-2 text-sm"
                >
                  Satın al
                </a>
              ) : null}
              {product.downloadUrl ? (
                <a
                  href={product.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="theme-btn-secondary inline-block rounded-md border border-slate-200 px-3 py-2 text-sm"
                >
                  İndir
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
