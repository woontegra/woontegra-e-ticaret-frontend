import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ProductDto, ProductStatus } from '@/shared/types/api';
import {
  createProduct,
  getProduct,
  getProductPublicPath,
  listBrands,
  listProductCategories,
  PRODUCT_STATUS_LABELS,
  slugifyClient,
  updateProduct,
} from '@/shared/api/products.api';
import {
  applyProductPreset,
  emptyPresetFormSlice,
  inferPresetFromProduct,
  type ProductPresetId,
} from '@/admin/config/productPresets';
import { ProductPresetSelector } from '@/admin/components/products/ProductPresetSelector';
import { ProductFormSummary } from '@/admin/components/products/ProductFormSummary';
import { ProductDeliveryTab } from '@/admin/components/products/ProductDeliveryTab';
import { ProductAttributesTab } from '@/admin/components/ProductAttributesTab';
import { ProductVariantsTab } from '@/admin/components/ProductVariantsTab';
import { AdminPageHeader, FormSection } from '@/admin/components/ui';
import { useAdminMutationFeedback } from '@/admin/hooks/useAdminMutationFeedback';
import {
  hasDownloadFiles,
  normalizeDownloadFiles,
} from '@/shared/lib/productDownloadFiles';
import { cn } from '@/shared/lib/cn';
import {
  Badge,
  Button,
  Input,
  Label,
  MediaField,
  MediaMultiField,
  RichTextEditor,
  Select,
  Textarea,
} from '@/shared/ui';

type Tab = 'basic' | 'pricing' | 'delivery' | 'media' | 'seo' | 'advanced';

const FORM_TABS: Array<{ id: Tab; label: string }> = [
  { id: 'basic', label: 'Temel Bilgiler' },
  { id: 'pricing', label: 'Fiyat & Satış' },
  { id: 'delivery', label: 'Teslimat & Lisans' },
  { id: 'media', label: 'Görseller & Dosyalar' },
  { id: 'seo', label: 'SEO & Yayın' },
];

function emptyForm(): Partial<ProductDto> & {
  tagsInput: string;
  featureBulletsInput: string;
} {
  const preset = emptyPresetFormSlice();
  return {
    name: '',
    slug: '',
    sku: '',
    barcode: '',
    productKind: preset.productKind,
    deliveryMode: preset.deliveryMode,
    purchaseEnabled: preset.purchaseEnabled,
    currency: 'TRY',
    compareAtPrice: null,
    version: '',
    featureBullets: [],
    featureBulletsInput: '',
    sortOrder: 0,
    licenseRequired: preset.licenseRequired,
    licenseAppCode: preset.licenseAppCode,
    licenseDays: preset.licenseDays,
    licenseMonths: preset.licenseMonths,
    licenseMaxDevices: preset.licenseMaxDevices,
    saasAppCode: preset.saasAppCode,
    saasPlanCode: null,
    saasTrialDays: null,
    saasRequiresLogin: preset.saasRequiresLogin,
    downloadFiles: preset.downloadFiles,
    shortDescription: '',
    descriptionHtml: '',
    categoryId: null,
    brandId: null,
    status: 'DRAFT',
    basePrice: null,
    salePrice: null,
    taxRate: 20,
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

function productToForm(product: ProductDto) {
  return {
    ...product,
    deliveryMode: product.deliveryMode ?? 'NONE',
    purchaseEnabled: product.purchaseEnabled ?? true,
    currency: product.currency ?? 'TRY',
    featureBullets: product.featureBullets ?? [],
    sortOrder: product.sortOrder ?? 0,
    licenseRequired: product.licenseRequired ?? false,
    saasRequiresLogin: product.saasRequiresLogin ?? false,
    downloadFiles: normalizeDownloadFiles(product.downloadFiles),
    tagsInput: (product.tags ?? []).join(', '),
    featureBulletsInput: (product.featureBullets ?? []).join('\n'),
  };
}

function computeWarnings(form: Partial<ProductDto>): string[] {
  const warnings: string[] = [];
  if (!form.name?.trim()) warnings.push('Ürün adı gerekli');
  if (!form.slug?.trim()) warnings.push('Slug gerekli');
  if (
    form.deliveryMode === 'LICENSED_DOWNLOAD' &&
    !form.licenseAppCode?.trim()
  ) {
    warnings.push('Merkezi lisans için uygulama kodu gerekli');
  }
  if (
    (form.deliveryMode === 'PAID_DOWNLOAD' ||
      form.deliveryMode === 'LICENSED_DOWNLOAD' ||
      form.deliveryMode === 'FREE_DOWNLOAD') &&
    !hasDownloadFiles(form.downloadFiles)
  ) {
    warnings.push('İndirme dosyası URL tanımlanmadı (R2 fazında tamamlanacak)');
  }
  if (form.deliveryMode === 'SAAS' && !form.saasAppCode?.trim()) {
    warnings.push('SaaS uygulama kodu önerilir');
  }
  if (!form.mainImageId) warnings.push('Kapak görseli önerilir');
  return warnings;
}

export function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const productId = isNew ? undefined : id;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { onSuccess, onError } = useAdminMutationFeedback();

  const initialTabParam = searchParams.get('tab');
  const [tab, setTab] = useState<Tab>(() => {
    if (initialTabParam === 'variants' || initialTabParam === 'advanced') {
      return 'advanced';
    }
    if (
      initialTabParam &&
      ['basic', 'pricing', 'delivery', 'media', 'seo'].includes(initialTabParam)
    ) {
      return initialTabParam as Tab;
    }
    return 'basic';
  });
  const [form, setForm] = useState(emptyForm());
  const [presetId, setPresetId] = useState<ProductPresetId>('DOWNLOADABLE');
  const [slugTouched, setSlugTouched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const productQuery = useQuery({
    queryKey: ['admin', 'products', productId],
    queryFn: () => getProduct(productId!),
    enabled: !isNew && Boolean(productId),
  });

  const categoriesQuery = useQuery({
    queryKey: ['admin', 'product-categories', 'options'],
    queryFn: () => listProductCategories({ limit: 200 }),
    select: (data) => data.items,
  });

  const brandsQuery = useQuery({
    queryKey: ['admin', 'brands', 'options'],
    queryFn: () => listBrands({ limit: 200 }),
    select: (data) => data.items,
  });

  useEffect(() => {
    if (productQuery.data) {
      const next = productToForm(productQuery.data);
      setForm(next);
      setPresetId(
        inferPresetFromProduct({
          deliveryMode: next.deliveryMode,
          productKind: next.productKind,
          purchaseEnabled: next.purchaseEnabled,
          licenseRequired: next.licenseRequired,
        }),
      );
      setSlugTouched(true);
    }
  }, [productQuery.data]);

  const updateField = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePresetChange = (nextPreset: ProductPresetId) => {
    setPresetId(nextPreset);
    setForm((prev) => {
      const applied = applyProductPreset(nextPreset, {
        productKind: prev.productKind ?? 'SOFTWARE',
        deliveryMode: prev.deliveryMode ?? 'PAID_DOWNLOAD',
        purchaseEnabled: prev.purchaseEnabled ?? true,
        licenseRequired: prev.licenseRequired ?? false,
        licenseAppCode: prev.licenseAppCode ?? null,
        licenseDays: prev.licenseDays ?? null,
        licenseMaxDevices: prev.licenseMaxDevices ?? null,
        licenseMonths: prev.licenseMonths ?? null,
        saasAppCode: prev.saasAppCode ?? null,
        saasRequiresLogin: prev.saasRequiresLogin ?? false,
        basePrice: prev.basePrice ?? null,
        salePrice: prev.salePrice ?? null,
        downloadFiles: normalizeDownloadFiles(prev.downloadFiles),
      });
      return {
        ...prev,
        ...applied,
        downloadFiles: applied.downloadFiles,
      };
    });
  };

  const isFreeMode =
    form.deliveryMode === 'FREE_DOWNLOAD' || form.deliveryMode === 'QUOTE_ONLY';
  const warnings = useMemo(() => computeWarnings(form), [form]);

  const buildPayload = (statusOverride?: ProductStatus) => ({
    name: form.name,
    slug: form.slug,
    sku: form.sku || null,
    barcode: form.barcode || null,
    productKind: form.productKind,
    deliveryMode: form.deliveryMode,
    purchaseEnabled: form.purchaseEnabled,
    currency: form.currency ?? 'TRY',
    compareAtPrice: form.compareAtPrice,
    version: form.version || null,
    featureBullets: form.featureBulletsInput
      ? form.featureBulletsInput.split('\n').map((l) => l.trim()).filter(Boolean)
      : [],
    sortOrder: form.sortOrder ?? 0,
    licenseRequired: form.licenseRequired ?? false,
    licenseAppCode: form.licenseAppCode || null,
    licenseDays: form.licenseDays,
    licenseMonths: form.licenseMonths,
    licenseMaxDevices: form.licenseMaxDevices,
    saasAppCode: form.saasAppCode || null,
    saasPlanCode: form.saasPlanCode || null,
    saasTrialDays: form.saasTrialDays,
    saasRequiresLogin: form.saasRequiresLogin ?? false,
    downloadFiles: form.downloadFiles ?? null,
    shortDescription: form.shortDescription || null,
    descriptionHtml: form.descriptionHtml ?? '',
    categoryId: form.categoryId || null,
    brandId: form.brandId || null,
    status: statusOverride ?? form.status,
    basePrice: isFreeMode ? 0 : form.basePrice,
    salePrice: isFreeMode ? 0 : form.salePrice,
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

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    queryClient.invalidateQueries({ queryKey: ['public', 'products'] });
  };

  const saveMutation = useMutation({
    mutationFn: (statusOverride?: ProductStatus) =>
      isNew
        ? createProduct(buildPayload(statusOverride))
        : updateProduct(productId!, buildPayload(statusOverride)),
    onSuccess: (data, statusOverride) => {
      setForm(productToForm(data));
      setPresetId(
        inferPresetFromProduct({
          deliveryMode: data.deliveryMode,
          productKind: data.productKind,
          purchaseEnabled: data.purchaseEnabled,
          licenseRequired: data.licenseRequired,
        }),
      );
      invalidate();
      setErrorMessage(null);
      onSuccess(
        statusOverride === 'DRAFT' ? 'Taslak kaydedildi.' : 'Ürün kaydedildi.',
      );
      if (isNew) {
        navigate(`/admin/products/${data.id}/edit`, { replace: true });
      }
    },
    onError: (error) => {
      setErrorMessage(onError(error, 'Kayıt başarısız.'));
    },
  });

  if (!isNew && productQuery.isLoading) {
    return <p className="text-sm text-[rgb(var(--admin-text-muted))]">Yükleniyor…</p>;
  }

  const tabs = [
    ...FORM_TABS,
    ...(!isNew ? [{ id: 'advanced' as Tab, label: 'Varyant & Özellik' }] : []),
  ];

  return (
    <div className="admin-page pb-8">
      <AdminPageHeader
        title={isNew ? 'Yeni Ürün / Yazılım' : form.name || 'Ürün Düzenle'}
        description="Ürün tipi, fiyat, teslimat ve yayın ayarlarını yönetin"
        backTo="/admin/products"
        backLabel="Ürünler"
        actions={
          !isNew && form.slug && form.status === 'ACTIVE' ? (
            <Link
              to={getProductPublicPath({
                slug: form.slug,
                productKind: form.productKind ?? 'SOFTWARE',
              })}
              target="_blank"
              className="text-xs text-[rgb(var(--admin-text-muted))] hover:text-[rgb(var(--admin-primary))]"
            >
              Public önizleme →
            </Link>
          ) : null
        }
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          <FormSection
            title="Ürün tipi"
            description="Preset seçerek alanları hızlıca yapılandırın"
          >
            <ProductPresetSelector value={presetId} onChange={handlePresetChange} />
          </FormSection>

          <div className="flex flex-wrap gap-1 border-b border-[rgb(var(--admin-border))] pb-2">
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  tab === item.id
                    ? 'bg-[rgb(var(--admin-primary))] text-white'
                    : 'text-[rgb(var(--admin-text-muted))] hover:bg-[rgb(var(--admin-sidebar-hover))]',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {tab === 'basic' ? (
            <FormSection title="Temel Bilgiler">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Ürün adı</Label>
                  <Input
                    value={form.name ?? ''}
                    onChange={(e) => {
                      const name = e.target.value;
                      updateField('name', name);
                      if (!slugTouched) {
                        updateField('slug', slugifyClient(name));
                      }
                    }}
                  />
                </div>
                <div>
                  <Label>Slug</Label>
                  <Input
                    value={form.slug ?? ''}
                    onChange={(e) => {
                      setSlugTouched(true);
                      updateField('slug', slugifyClient(e.target.value));
                    }}
                  />
                </div>
                <div>
                  <Label>Kategori</Label>
                  <Select
                    value={form.categoryId ?? ''}
                    onChange={(e) =>
                      updateField('categoryId', e.target.value || null)
                    }
                  >
                    <option value="">Seçin</option>
                    {categoriesQuery.data?.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Marka</Label>
                  <Select
                    value={form.brandId ?? ''}
                    onChange={(e) =>
                      updateField('brandId', e.target.value || null)
                    }
                  >
                    <option value="">Seçin</option>
                    {brandsQuery.data?.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>SKU</Label>
                  <Input
                    value={form.sku ?? ''}
                    onChange={(e) => updateField('sku', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Sürüm</Label>
                  <Input
                    value={form.version ?? ''}
                    onChange={(e) => updateField('version', e.target.value)}
                    disabled={form.deliveryMode === 'QUOTE_ONLY'}
                  />
                </div>
                <div>
                  <Label>Sıra</Label>
                  <Input
                    type="number"
                    value={form.sortOrder ?? 0}
                    onChange={(e) =>
                      updateField('sortOrder', Number(e.target.value) || 0)
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Kısa açıklama</Label>
                <Textarea
                  rows={2}
                  value={form.shortDescription ?? ''}
                  onChange={(e) => updateField('shortDescription', e.target.value)}
                />
              </div>
              <div>
                <Label>Detay açıklama</Label>
                <RichTextEditor
                  value={form.descriptionHtml ?? ''}
                  onChange={(value) => updateField('descriptionHtml', value)}
                />
              </div>
              <div>
                <Label>Öne çıkan özellikler (satır başına bir madde)</Label>
                <Textarea
                  rows={4}
                  value={form.featureBulletsInput ?? ''}
                  onChange={(e) =>
                    updateField('featureBulletsInput', e.target.value)
                  }
                  placeholder="Hızlı kurulum&#10;Merkezi lisans desteği"
                />
              </div>
            </FormSection>
          ) : null}

          {tab === 'pricing' ? (
            <FormSection title="Fiyat & Satış">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Satış fiyatı</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={isFreeMode ? 0 : (form.salePrice ?? '')}
                    disabled={isFreeMode}
                    onChange={(e) =>
                      updateField(
                        'salePrice',
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                  />
                </div>
                <div>
                  <Label>Liste fiyatı</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={isFreeMode ? 0 : (form.basePrice ?? '')}
                    disabled={isFreeMode}
                    onChange={(e) =>
                      updateField(
                        'basePrice',
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                  />
                </div>
                <div>
                  <Label>Karşılaştırma fiyatı</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.compareAtPrice ?? ''}
                    disabled={isFreeMode}
                    onChange={(e) =>
                      updateField(
                        'compareAtPrice',
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                  />
                </div>
                <div>
                  <Label>Para birimi</Label>
                  <Input
                    value={form.currency ?? 'TRY'}
                    onChange={(e) => updateField('currency', e.target.value)}
                  />
                </div>
                <div>
                  <Label>KDV (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={form.taxRate ?? ''}
                    onChange={(e) =>
                      updateField(
                        'taxRate',
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.purchaseEnabled ?? true}
                  disabled={form.deliveryMode === 'FREE_DOWNLOAD' || form.deliveryMode === 'QUOTE_ONLY'}
                  onChange={(e) => updateField('purchaseEnabled', e.target.checked)}
                />
                Sepete eklenebilir (satışa açık)
              </label>
              {form.deliveryMode === 'QUOTE_ONLY' ? (
                <p className="text-xs text-[rgb(var(--admin-text-muted))]">
                  Hizmet / teklif ürünlerinde sepete ekleme kapalıdır; müşteriler
                  teklif formu kullanır.
                </p>
              ) : null}
              {form.productKind === 'PHYSICAL' ? (
                <div className="grid gap-4 border-t border-[rgb(var(--admin-border-subtle))] pt-4 sm:grid-cols-2">
                  <label className="flex items-center gap-2 text-sm sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={form.stockTrackingEnabled ?? false}
                      onChange={(e) =>
                        updateField('stockTrackingEnabled', e.target.checked)
                      }
                    />
                    Stok takibi
                  </label>
                  <div>
                    <Label>Stok adedi</Label>
                    <Input
                      type="number"
                      value={form.stockQuantity ?? ''}
                      onChange={(e) =>
                        updateField(
                          'stockQuantity',
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label>Düşük stok eşiği</Label>
                    <Input
                      type="number"
                      value={form.lowStockThreshold ?? ''}
                      onChange={(e) =>
                        updateField(
                          'lowStockThreshold',
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                    />
                  </div>
                </div>
              ) : null}
            </FormSection>
          ) : null}

          {tab === 'delivery' && form.deliveryMode ? (
            <ProductDeliveryTab
              deliveryMode={form.deliveryMode}
              form={form}
              onChange={(key, value) => updateField(key as keyof typeof form, value as never)}
            />
          ) : null}

          {tab === 'media' ? (
            <FormSection
              title="Görseller & Dosyalar"
              description="Kapak ve galeri görselleri Vercel Blob medya kütüphanesinden seçilir."
            >
              <MediaField
                label="Kapak görseli"
                value={form.mainImageId ?? null}
                onChange={(value) => updateField('mainImageId', value)}
                folder="products"
                usageType="PRODUCT_IMAGE"
              />
              <MediaMultiField
                label="Galeri görselleri"
                value={form.galleryImageIds ?? []}
                onChange={(value) => updateField('galleryImageIds', value)}
                folder="products"
                usageType="PRODUCT_IMAGE"
              />
            </FormSection>
          ) : null}

          {tab === 'seo' ? (
            <FormSection title="SEO & Yayın">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label>Yayın durumu</Label>
                  <Select
                    value={form.status ?? 'DRAFT'}
                    onChange={(e) =>
                      updateField('status', e.target.value as ProductStatus)
                    }
                  >
                    {Object.entries(PRODUCT_STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Label>SEO başlık</Label>
                  <Input
                    value={form.seoTitle ?? ''}
                    onChange={(e) => updateField('seoTitle', e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>SEO açıklama</Label>
                  <Textarea
                    rows={2}
                    value={form.seoDescription ?? ''}
                    onChange={(e) =>
                      updateField('seoDescription', e.target.value)
                    }
                  />
                </div>
                <MediaField
                  label="OG görseli"
                  value={form.ogImageId ?? null}
                  onChange={(value) => updateField('ogImageId', value)}
                  folder="products"
                />
                <div>
                  <Label>Canonical URL</Label>
                  <Input
                    value={form.canonicalUrl ?? ''}
                    onChange={(e) => updateField('canonicalUrl', e.target.value)}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.robotsIndex ?? true}
                  onChange={(e) => updateField('robotsIndex', e.target.checked)}
                />
                Arama motorlarında indekslensin
              </label>
              <div className="flex flex-wrap gap-4 border-t border-[rgb(var(--admin-border-subtle))] pt-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.isFeatured ?? false}
                    onChange={(e) => updateField('isFeatured', e.target.checked)}
                  />
                  Öne çıkan
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.isNew ?? false}
                    onChange={(e) => updateField('isNew', e.target.checked)}
                  />
                  Yeni
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.isBestSeller ?? false}
                    onChange={(e) =>
                      updateField('isBestSeller', e.target.checked)
                    }
                  />
                  Çok satan
                </label>
              </div>
              {!isNew && form.status ? (
                <div className="flex flex-wrap gap-2">
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
                </div>
              ) : null}
            </FormSection>
          ) : null}

          {tab === 'advanced' && productId ? (
            <FormSection title="Varyant & Özellik">
              <div className="space-y-6">
                <ProductAttributesTab productId={productId} />
                <ProductVariantsTab productId={productId} />
              </div>
            </FormSection>
          ) : null}

          {errorMessage ? (
            <p className="text-sm text-red-600">{errorMessage}</p>
          ) : null}

          <div className="sticky bottom-0 z-10 flex items-center justify-end gap-2 border-t border-[rgb(var(--admin-border))] bg-[rgb(var(--admin-bg))]/95 py-3 backdrop-blur-sm">
            <Button
              variant="secondary"
              type="button"
              onClick={() => navigate('/admin/products')}
              disabled={saveMutation.isPending}
            >
              İptal
            </Button>
            <Button
              variant="secondary"
              type="button"
              disabled={saveMutation.isPending}
              onClick={() => saveMutation.mutate('DRAFT')}
            >
              Taslak kaydet
            </Button>
            <Button
              type="button"
              disabled={saveMutation.isPending}
              onClick={() => saveMutation.mutate(undefined)}
            >
              {isNew ? 'Oluştur' : 'Kaydet'}
            </Button>
          </div>
        </div>

        <aside className="lg:sticky lg:top-4 lg:self-start">
          <ProductFormSummary form={form} warnings={warnings} />
        </aside>
      </div>
    </div>
  );
}
