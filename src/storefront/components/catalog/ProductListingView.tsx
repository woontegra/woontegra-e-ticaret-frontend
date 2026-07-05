import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Filter, Grid3X3, LayoutList, X } from 'lucide-react';
import type { ProductKind, PublicProductSort } from '@/shared/types/api';
import {
  listFilterableAttributes,
  listPublicBrands,
  listPublicProductCategories,
  listPublicProducts,
} from '@/shared/api/products.api';
import { ProductCard } from '@/storefront/components/ProductCard';
import { usePublicTheme } from '@/storefront/hooks/usePublicTheme';
import {
  useProductListingParams,
  type ProductListingViewMode,
} from '@/storefront/hooks/useProductListingParams';
import { ProductListingFilters } from './ProductListingFilters';
import { cn } from '@/shared/lib/cn';

const SORT_OPTIONS: Array<{ value: PublicProductSort; label: string }> = [
  { value: 'featured', label: 'Öne çıkan' },
  { value: 'newest', label: 'En yeni' },
  { value: 'price_asc', label: 'Fiyat artan' },
  { value: 'price_desc', label: 'Fiyat azalan' },
];

interface ProductListingViewProps {
  productKind?: ProductKind;
  defaultCategory?: string;
  defaultBrand?: string;
  lockCategory?: string;
  lockBrand?: string;
}

export function ProductListingView({
  productKind,
  defaultCategory,
  defaultBrand,
  lockCategory,
  lockBrand,
}: ProductListingViewProps) {
  const themeQuery = usePublicTheme();
  const showBadge = themeQuery.data?.productCardStyle.showBadge ?? true;
  const { params, updateParams, apiParams, pageSize } = useProductListingParams({
    category: defaultCategory,
    brand: defaultBrand,
    productKind,
  });

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const productsQuery = useQuery({
    queryKey: ['public', 'products', apiParams],
    queryFn: () => listPublicProducts(apiParams),
  });

  const categoriesQuery = useQuery({
    queryKey: ['public', 'categories'],
    queryFn: () => listPublicProductCategories({ limit: 100 }),
  });

  const brandsQuery = useQuery({
    queryKey: ['public', 'brands'],
    queryFn: listPublicBrands,
  });

  const filterAttributesQuery = useQuery({
    queryKey: ['public', 'filter-attributes'],
    queryFn: listFilterableAttributes,
  });

  useEffect(() => {
    document.body.style.overflow = mobileFiltersOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileFiltersOpen]);

  const total = productsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const items = productsQuery.data?.items ?? [];

  const handleFilterChange = (patch: Parameters<typeof updateParams>[0]) => {
    updateParams(patch);
  };

  const filtersPanel = (
    <ProductListingFilters
      params={params}
      categories={categoriesQuery.data ?? []}
      brands={brandsQuery.data ?? []}
      filterAttributes={filterAttributesQuery.data ?? []}
      onChange={handleFilterChange}
      lockCategory={lockCategory}
      lockBrand={lockBrand}
    />
  );

  return (
    <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-4 rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-4 text-sm font-semibold text-slate-800">Filtreler</h2>
          {filtersPanel}
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm lg:hidden"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <Filter className="h-4 w-4" />
              Filtrele
            </button>
            <p className="text-sm text-theme-muted">
              {productsQuery.isPending ? 'Yükleniyor…' : `${total} sonuç`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={params.sort}
              onChange={(event) =>
                updateParams({ sort: event.target.value as PublicProductSort })
              }
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              aria-label="Sıralama"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="flex rounded-md border border-slate-200 p-0.5">
              {(['grid', 'list'] as ProductListingViewMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  aria-label={mode === 'grid' ? 'Izgara görünüm' : 'Liste görünüm'}
                  className={cn(
                    'rounded p-1.5',
                    params.view === mode
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-500 hover:bg-slate-100',
                  )}
                  onClick={() => updateParams({ view: mode }, false)}
                >
                  {mode === 'grid' ? (
                    <Grid3X3 className="h-4 w-4" />
                  ) : (
                    <LayoutList className="h-4 w-4" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {productsQuery.isPending ? (
          <div
            className={cn(
              'mt-6 gap-4',
              params.view === 'grid'
                ? 'grid sm:grid-cols-2 xl:grid-cols-3'
                : 'flex flex-col',
            )}
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="animate-pulse space-y-3">
                <div className="theme-product-card-image rounded-lg bg-slate-100" />
                <div className="h-3 w-2/3 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="mt-8 text-sm text-theme-muted">
            Filtrelere uygun ürün bulunamadı.
          </p>
        ) : (
          <div
            className={cn(
              'mt-6 gap-4',
              params.view === 'grid'
                ? 'grid sm:grid-cols-2 xl:grid-cols-3'
                : 'flex flex-col',
            )}
          >
            {items.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                view={params.view}
                showBadge={showBadge}
              />
            ))}
          </div>
        )}

        {totalPages > 1 ? (
          <nav
            className="mt-8 flex items-center justify-center gap-2"
            aria-label="Sayfalama"
          >
            <button
              type="button"
              disabled={params.page <= 1}
              onClick={() => updateParams({ page: params.page - 1 }, false)}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-40"
            >
              Önceki
            </button>
            <span className="text-sm text-slate-600">
              {params.page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={params.page >= totalPages}
              onClick={() => updateParams({ page: params.page + 1 }, false)}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-40"
            >
              Sonraki
            </button>
          </nav>
        ) : null}
      </div>

      {mobileFiltersOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Filtreleri kapat"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-full max-w-sm flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h2 className="text-sm font-semibold">Filtreler</h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Kapat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">{filtersPanel}</div>
            <div className="border-t border-slate-200 p-4">
              <button
                type="button"
                className="theme-btn-primary w-full rounded-md py-2 text-sm"
                onClick={() => setMobileFiltersOpen(false)}
              >
                Sonuçları göster
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
