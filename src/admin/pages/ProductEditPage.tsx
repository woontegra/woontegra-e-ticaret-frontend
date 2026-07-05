import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ProductDto, ProductKind, ProductStatus } from '@/shared/types/api';
import { ApiError } from '@/shared/api/client';
import {
  createProduct,
  getProduct,
  getProductPublicPath,
  listBrands,
  listProductCategories,
  PRODUCT_KIND_LABELS,
  PRODUCT_STATUS_LABELS,
  slugifyClient,
  updateProduct,
} from '@/shared/api/products.api';
import { ProductsSubNav } from '@/admin/components/ProductsSubNav';
import { ProductAttributesTab } from '@/admin/components/ProductAttributesTab';
import { ProductVariantsTab } from '@/admin/components/ProductVariantsTab';
import { cn } from '@/shared/lib/cn';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Input,
  Label,
  MediaField,
  MediaMultiField,
  RichTextEditor,
  Select,
  Textarea,
} from '@/shared/ui';

type Tab =
  | 'general'
  | 'pricing'
  | 'images'
  | 'attributes'
  | 'variants'
  | 'software'
  | 'seo'
  | 'status';

const tabs: Array<{ id: Tab; label: string }> = [
  { id: 'general', label: 'Genel bilgiler' },
  { id: 'pricing', label: 'Fiyat / satış' },
  { id: 'images', label: 'Görseller' },
  { id: 'attributes', label: 'Özellikler' },
  { id: 'variants', label: 'Varyantlar' },
  { id: 'software', label: 'Yazılım linkleri' },
  { id: 'seo', label: 'SEO' },
  { id: 'status', label: 'Yayın durumu' },
];

function emptyForm(): Partial<ProductDto> & { tagsInput: string } {
  return {
    name: '',
    slug: '',
    sku: '',
    barcode: '',
    productKind: 'SOFTWARE',
    shortDescription: '',
    descriptionHtml: '',
    categoryId: null,
    brandId: null,
    status: 'DRAFT',
    basePrice: null,
    salePrice: null,
    taxRate: null,
    stockTrackingEnabled: false,
    stockQuantity: null,
    lowStockThreshold: null,
    mainImageId: null,
    galleryImageIds: [],
    tags: [],
    tagsInput: '',
    isFeatured: false,
    isNew: false,
    isBestSeller: false,
    demoUrl: '',
    purchaseUrl: '',
    downloadUrl: '',
    seoTitle: '',
    seoDescription: '',
    ogImageId: null,
    canonicalUrl: '',
    robotsIndex: true,
  };
}

export function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<Tab>('general');
  const [form, setForm] = useState(emptyForm());
  const [slugTouched, setSlugTouched] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const productQuery = useQuery({
    queryKey: ['admin', 'products', id],
    queryFn: () => getProduct(id!),
    enabled: !isNew && Boolean(id),
  });

  const categoriesQuery = useQuery({
    queryKey: ['admin', 'product-categories'],
    queryFn: listProductCategories,
  });

  const brandsQuery = useQuery({
    queryKey: ['admin', 'brands'],
    queryFn: listBrands,
  });

  useEffect(() => {
    if (productQuery.data) {
      setForm({
        ...productQuery.data,
        tagsInput: productQuery.data.tags.join(', '),
      });
      setSlugTouched(true);
    }
  }, [productQuery.data]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    queryClient.invalidateQueries({ queryKey: ['public', 'products'] });
  };

  const buildPayload = () => ({
    name: form.name,
    slug: form.slug,
    sku: form.sku || null,
    barcode: form.barcode || null,
    productKind: form.productKind,
    shortDescription: form.shortDescription || null,
    descriptionHtml: form.descriptionHtml ?? '',
    categoryId: form.categoryId || null,
    brandId: form.brandId || null,
    status: form.status,
    basePrice: form.basePrice,
    salePrice: form.salePrice,
    taxRate: form.taxRate,
    stockTrackingEnabled: form.stockTrackingEnabled,
    stockQuantity: form.stockQuantity,
    lowStockThreshold: form.lowStockThreshold,
    mainImageId: form.mainImageId,
    galleryImageIds: form.galleryImageIds ?? [],
    tags: form.tagsInput
      ? form.tagsInput.split(',').map((tag) => tag.trim()).filter(Boolean)
      : [],
    isFeatured: form.isFeatured,
    isNew: form.isNew,
    isBestSeller: form.isBestSeller,
    demoUrl: form.demoUrl || null,
    purchaseUrl: form.purchaseUrl || null,
    downloadUrl: form.downloadUrl || null,
    seoTitle: form.seoTitle || null,
    seoDescription: form.seoDescription || null,
    ogImageId: form.ogImageId,
    canonicalUrl: form.canonicalUrl || null,
    robotsIndex: form.robotsIndex,
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      isNew ? createProduct(buildPayload()) : updateProduct(id!, buildPayload()),
    onSuccess: (data) => {
      setForm({ ...data, tagsInput: data.tags.join(', ') });
      invalidate();
      setMessage('Ürün kaydedildi.');
      setErrorMessage(null);
      if (isNew) {
        navigate(`/admin/products/${data.id}`, { replace: true });
      }
    },
    onError: (error) => {
      setMessage(null);
      setErrorMessage(
        error instanceof ApiError ? error.message : 'Kayıt başarısız.',
      );
    },
  });

  const setStatusMutation = useMutation({
    mutationFn: (status: ProductStatus) =>
      updateProduct(id!, { ...buildPayload(), status }),
    onSuccess: (data) => {
      setForm({ ...data, tagsInput: data.tags.join(', ') });
      invalidate();
      setMessage('Yayın durumu güncellendi.');
      setErrorMessage(null);
    },
  });

  const updateField = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <ProductsSubNav />
      <Card padding="sm">
        <CardHeader
          title={isNew ? 'Yeni ürün / yazılım' : form.name || 'Ürün düzenle'}
          description="Ürün bilgilerini sekmeler üzerinden yönetin"
          action={
            <div className="flex flex-wrap items-center gap-2">
              {!isNew && form.slug ? (
                <Link
                  to={getProductPublicPath({
                    slug: form.slug,
                    productKind: form.productKind ?? 'PHYSICAL',
                  })}
                  target="_blank"
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Public önizleme →
                </Link>
              ) : null}
              {!isNew && form.status ? (
                <Badge
                  variant={
                    form.status === 'ACTIVE'
                      ? 'success'
                      : form.status === 'DRAFT'
                        ? 'warning'
                        : 'default'
                  }
                >
                  {PRODUCT_STATUS_LABELS[form.status]}
                </Badge>
              ) : null}
              <Button
                size="sm"
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
              >
                Kaydet
              </Button>
            </div>
          }
        />

        {message ? (
          <p className="mb-3 text-sm text-green-700">{message}</p>
        ) : null}
        {errorMessage ? (
          <p className="mb-3 text-sm text-red-600">{errorMessage}</p>
        ) : null}

        <div className="mb-4 flex flex-wrap gap-1 border-b border-slate-100 pb-2">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm transition-colors',
                tab === item.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === 'general' ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="product-name">Ad</Label>
              <Input
                id="product-name"
                value={form.name ?? ''}
                onChange={(event) => {
                  const name = event.target.value;
                  updateField('name', name);
                  if (!slugTouched) {
                    updateField('slug', slugifyClient(name));
                  }
                }}
              />
            </div>
            <div>
              <Label htmlFor="product-slug">Slug</Label>
              <Input
                id="product-slug"
                value={form.slug ?? ''}
                onChange={(event) => {
                  setSlugTouched(true);
                  updateField('slug', slugifyClient(event.target.value));
                }}
              />
            </div>
            <div>
              <Label htmlFor="product-kind">Tür</Label>
              <Select
                id="product-kind"
                value={form.productKind ?? 'SOFTWARE'}
                onChange={(event) =>
                  updateField('productKind', event.target.value as ProductKind)
                }
              >
                {Object.entries(PRODUCT_KIND_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="product-sku">SKU</Label>
              <Input
                id="product-sku"
                value={form.sku ?? ''}
                onChange={(event) => updateField('sku', event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="product-barcode">Barkod</Label>
              <Input
                id="product-barcode"
                value={form.barcode ?? ''}
                onChange={(event) => updateField('barcode', event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="product-category">Kategori</Label>
              <Select
                id="product-category"
                value={form.categoryId ?? ''}
                onChange={(event) =>
                  updateField('categoryId', event.target.value || null)
                }
              >
                <option value="">Seçilmedi</option>
                {categoriesQuery.data?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="product-brand">Marka</Label>
              <Select
                id="product-brand"
                value={form.brandId ?? ''}
                onChange={(event) =>
                  updateField('brandId', event.target.value || null)
                }
              >
                <option value="">Seçilmedi</option>
                {brandsQuery.data?.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="product-short-desc">Kısa açıklama</Label>
              <Textarea
                id="product-short-desc"
                rows={3}
                value={form.shortDescription ?? ''}
                onChange={(event) =>
                  updateField('shortDescription', event.target.value)
                }
              />
            </div>
            <div className="md:col-span-2">
              <Label>Açıklama</Label>
              <RichTextEditor
                value={form.descriptionHtml ?? ''}
                onChange={(value) => updateField('descriptionHtml', value)}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="product-tags">Etiketler</Label>
              <Input
                id="product-tags"
                value={form.tagsInput ?? ''}
                onChange={(event) => updateField('tagsInput', event.target.value)}
                placeholder="Virgülle ayırın"
              />
            </div>
          </div>
        ) : null}

        {tab === 'pricing' ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="product-base-price">Liste fiyatı</Label>
              <Input
                id="product-base-price"
                type="number"
                min={0}
                step="0.01"
                value={form.basePrice ?? ''}
                onChange={(event) =>
                  updateField(
                    'basePrice',
                    event.target.value ? Number(event.target.value) : null,
                  )
                }
              />
            </div>
            <div>
              <Label htmlFor="product-sale-price">Satış fiyatı</Label>
              <Input
                id="product-sale-price"
                type="number"
                min={0}
                step="0.01"
                value={form.salePrice ?? ''}
                onChange={(event) =>
                  updateField(
                    'salePrice',
                    event.target.value ? Number(event.target.value) : null,
                  )
                }
              />
            </div>
            <div>
              <Label htmlFor="product-tax">KDV (%)</Label>
              <Input
                id="product-tax"
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={form.taxRate ?? ''}
                onChange={(event) =>
                  updateField(
                    'taxRate',
                    event.target.value ? Number(event.target.value) : null,
                  )
                }
              />
            </div>
            <div className="md:col-span-2 flex items-center gap-2">
              <input
                id="stock-tracking"
                type="checkbox"
                checked={form.stockTrackingEnabled ?? false}
                onChange={(event) =>
                  updateField('stockTrackingEnabled', event.target.checked)
                }
              />
              <Label htmlFor="stock-tracking">Stok takibi</Label>
            </div>
            {form.stockTrackingEnabled ? (
              <>
                <div>
                  <Label htmlFor="stock-qty">Stok adedi</Label>
                  <Input
                    id="stock-qty"
                    type="number"
                    value={form.stockQuantity ?? ''}
                    onChange={(event) =>
                      updateField(
                        'stockQuantity',
                        event.target.value ? Number(event.target.value) : null,
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="stock-threshold">Düşük stok eşiği</Label>
                  <Input
                    id="stock-threshold"
                    type="number"
                    value={form.lowStockThreshold ?? ''}
                    onChange={(event) =>
                      updateField(
                        'lowStockThreshold',
                        event.target.value ? Number(event.target.value) : null,
                      )
                    }
                  />
                </div>
              </>
            ) : null}
            <div className="md:col-span-2 space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isFeatured ?? false}
                  onChange={(event) =>
                    updateField('isFeatured', event.target.checked)
                  }
                />
                Öne çıkan
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isNew ?? false}
                  onChange={(event) => updateField('isNew', event.target.checked)}
                />
                Yeni
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isBestSeller ?? false}
                  onChange={(event) =>
                    updateField('isBestSeller', event.target.checked)
                  }
                />
                Çok satan
              </label>
            </div>
          </div>
        ) : null}

        {tab === 'images' ? (
          <div className="space-y-4">
            <MediaField
              label="Ana görsel"
              value={form.mainImageId ?? null}
              onChange={(value) => updateField('mainImageId', value)}
              folder="products"
            />
            <MediaMultiField
              label="Galeri görselleri"
              value={form.galleryImageIds ?? []}
              onChange={(value) => updateField('galleryImageIds', value)}
              folder="products"
            />
          </div>
        ) : null}

        {!isNew && tab === 'attributes' ? (
          <ProductAttributesTab productId={id!} />
        ) : null}

        {!isNew && tab === 'variants' ? (
          <ProductVariantsTab productId={id!} />
        ) : null}

        {isNew && (tab === 'attributes' || tab === 'variants') ? (
          <p className="text-sm text-slate-500">
            Önce ürünü kaydedin, ardından özellik ve varyantları yönetebilirsiniz.
          </p>
        ) : null}

        {tab === 'software' ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="demo-url">Demo URL</Label>
              <Input
                id="demo-url"
                value={form.demoUrl ?? ''}
                onChange={(event) => updateField('demoUrl', event.target.value)}
                placeholder="https://"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="purchase-url">Satın alma URL</Label>
              <Input
                id="purchase-url"
                value={form.purchaseUrl ?? ''}
                onChange={(event) =>
                  updateField('purchaseUrl', event.target.value)
                }
                placeholder="https://"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="download-url">İndirme URL</Label>
              <Input
                id="download-url"
                value={form.downloadUrl ?? ''}
                onChange={(event) =>
                  updateField('downloadUrl', event.target.value)
                }
                placeholder="https://"
              />
            </div>
          </div>
        ) : null}

        {tab === 'seo' ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="seo-title">SEO başlık</Label>
              <Input
                id="seo-title"
                value={form.seoTitle ?? ''}
                onChange={(event) => updateField('seoTitle', event.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="seo-desc">SEO açıklama</Label>
              <Textarea
                id="seo-desc"
                rows={3}
                value={form.seoDescription ?? ''}
                onChange={(event) =>
                  updateField('seoDescription', event.target.value)
                }
              />
            </div>
            <div className="md:col-span-2">
              <MediaField
                label="OG görsel"
                value={form.ogImageId ?? null}
                onChange={(value) => updateField('ogImageId', value)}
                folder="products"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="canonical-url">Canonical URL</Label>
              <Input
                id="canonical-url"
                value={form.canonicalUrl ?? ''}
                onChange={(event) =>
                  updateField('canonicalUrl', event.target.value)
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="robots-index"
                type="checkbox"
                checked={form.robotsIndex ?? true}
                onChange={(event) =>
                  updateField('robotsIndex', event.target.checked)
                }
              />
              <Label htmlFor="robots-index">Arama motorlarında indeksle</Label>
            </div>
          </div>
        ) : null}

        {tab === 'status' ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="product-status">Durum</Label>
              <Select
                id="product-status"
                value={form.status ?? 'DRAFT'}
                onChange={(event) =>
                  updateField('status', event.target.value as ProductStatus)
                }
              >
                {Object.entries(PRODUCT_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
            {!isNew ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={setStatusMutation.isPending}
                  onClick={() => setStatusMutation.mutate('ACTIVE')}
                >
                  Yayına al
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={setStatusMutation.isPending}
                  onClick={() => setStatusMutation.mutate('DRAFT')}
                >
                  Taslağa al
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={setStatusMutation.isPending}
                  onClick={() => setStatusMutation.mutate('PASSIVE')}
                >
                  Pasife al
                </Button>
              </div>
            ) : null}
            <p className="text-xs text-slate-500">
              Yalnızca &quot;Yayında&quot; durumundaki ürünler public sitede
              görünür.
            </p>
          </div>
        ) : null}
      </Card>
    </>
  );
}
