import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Filter, Grid3X3, LayoutList, X } from 'lucide-react';
import type { ProductKind, PublicProductSort } from '@/shared/types/api';
import { uiLabel } from '@/shared/lib/storefront-ui';
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
import { useStorefrontUi } from '@/storefront/hooks/useStorefrontUi';
import { cn } from '@/shared/lib/cn';

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
  const ui = useStorefrontUi();
  const sortOptions = (
    [
      { value: 'featured' as const, label: uiLabel(ui, 'catalogSortFeatured') },
      { value: 'newest' as const, label: uiLabel(ui, 'catalogSortNewest') },
      { value: 'price_asc' as const, label: uiLabel(ui, 'catalogSortPriceAsc') },
      { value: 'price_desc' as const, label: uiLabel(ui, 'catalogSortPriceDesc') },
    ] as const
  ).filter((option): option is { value: PublicProductSort; label: string } =>
    Boolean(option.label),
  );
  const catalogEmpty = uiLabel(ui, 'catalogEmpty');
  const catalogLoading = uiLabel(ui, 'catalogLoading');
  const catalogResultsSuffix = uiLabel(ui, 'catalogResultsSuffix');
  const catalogFiltersTitle = uiLabel(ui, 'catalogFiltersTitle');
  const catalogFilterButton = uiLabel(ui, 'catalogFilterButton');
  const catalogGridView = uiLabel(ui, 'catalogGridView');
  const catalogListView = uiLabel(ui, 'catalogListView');
  const catalogPrev = uiLabel(ui, 'catalogPrev');
  const catalogNext = uiLabel(ui, 'catalogNext');
  const catalogCloseFilters = uiLabel(ui, 'catalogCloseFilters');
  const catalogShowResults = uiLabel(ui, 'catalogShowResults');

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
          {catalogFiltersTitle ? (
            <h2 className="mb-4 text-sm font-semibold text-slate-800">
              {catalogFiltersTitle}
            </h2>
          ) : null}
          {filtersPanel}
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {catalogFilterButton ? (
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm lg:hidden"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <Filter className="h-4 w-4" />
                {catalogFilterButton}
              </button>
            ) : null}
            <p className="text-sm text-theme-muted">
              {productsQuery.isPending
                ? catalogLoading
                : catalogResultsSuffix
                  ? `${total} ${catalogResultsSuffix}`
                  : null}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {sortOptions.length > 0 ? (
              <select
                value={params.sort}
                onChange={(event) =>
                  updateParams({ sort: event.target.value as PublicProductSort })
                }
                className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : null}

            <div className="flex rounded-md border border-slate-200 p-0.5">
              {(['grid', 'list'] as ProductListingViewMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  aria-label={
                    mode === 'grid'
                      ? catalogGridView ?? undefined
                      : catalogListView ?? undefined
                  }
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
          catalogEmpty ? (
            <p className="mt-8 text-sm text-theme-muted">{catalogEmpty}</p>
          ) : null
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
                showDeliveryBadge={productKind === 'SOFTWARE'}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (catalogPrev || catalogNext) ? (
          <nav
            className="mt-8 flex items-center justify-center gap-2"
            aria-label="Sayfalama"
          >
            {catalogPrev ? (
              <button
                type="button"
                disabled={params.page <= 1}
                onClick={() => updateParams({ page: params.page - 1 }, false)}
                className="rounded-md border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-40"
              >
                {catalogPrev}
              </button>
            ) : null}
            <span className="text-sm text-slate-600">
              {params.page} / {totalPages}
            </span>
            {catalogNext ? (
              <button
                type="button"
                disabled={params.page >= totalPages}
                onClick={() => updateParams({ page: params.page + 1 }, false)}
                className="rounded-md border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-40"
              >
                {catalogNext}
              </button>
            ) : null}
          </nav>
        ) : null}
      </div>

      {mobileFiltersOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label={catalogCloseFilters ?? undefined}
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-full max-w-sm flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              {catalogFiltersTitle ? (
                <h2 className="text-sm font-semibold">{catalogFiltersTitle}</h2>
              ) : null}
              {catalogCloseFilters ? (
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  aria-label={catalogCloseFilters}
                >
                  <X className="h-5 w-5" />
                </button>
              ) : null}
            </div>
            <div className="flex-1 overflow-y-auto p-4">{filtersPanel}</div>
            {catalogShowResults ? (
              <div className="border-t border-slate-200 p-4">
                <button
                  type="button"
                  className="theme-btn-primary w-full rounded-md py-2 text-sm"
                  onClick={() => setMobileFiltersOpen(false)}
                >
                  {catalogShowResults}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
