import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ProductKind, PublicProductSort } from '@/shared/types/api';

export type ProductListingViewMode = 'grid' | 'list';

export interface ProductListingParams {
  search: string;
  category: string;
  brand: string;
  minPrice: string;
  maxPrice: string;
  attrValues: string[];
  sort: PublicProductSort;
  view: ProductListingViewMode;
  page: number;
}

const DEFAULT_SORT: PublicProductSort = 'featured';
const DEFAULT_VIEW: ProductListingViewMode = 'grid';
const PAGE_SIZE = 12;

function parsePage(value: string | null): number {
  const page = Number(value);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function parseSort(value: string | null): PublicProductSort {
  if (
    value === 'newest' ||
    value === 'price_asc' ||
    value === 'price_desc' ||
    value === 'featured'
  ) {
    return value;
  }
  return DEFAULT_SORT;
}

function parseView(value: string | null): ProductListingViewMode {
  return value === 'list' ? 'list' : DEFAULT_VIEW;
}

export function useProductListingParams(defaults?: {
  category?: string;
  brand?: string;
  productKind?: ProductKind;
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const params = useMemo<ProductListingParams>(() => {
    const attrRaw = searchParams.get('attrs');
    return {
      search: searchParams.get('q') ?? '',
      category: searchParams.get('category') ?? defaults?.category ?? '',
      brand: searchParams.get('brand') ?? defaults?.brand ?? '',
      minPrice: searchParams.get('minPrice') ?? '',
      maxPrice: searchParams.get('maxPrice') ?? '',
      attrValues: attrRaw
        ? attrRaw.split(',').map((item) => item.trim()).filter(Boolean)
        : [],
      sort: parseSort(searchParams.get('sort')),
      view: parseView(searchParams.get('view')),
      page: parsePage(searchParams.get('page')),
    };
  }, [searchParams, defaults?.category, defaults?.brand]);

  const updateParams = useCallback(
    (patch: Partial<ProductListingParams>, resetPage = true) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);

        const apply = (key: string, value: string | undefined | null) => {
          if (value === undefined) return;
          if (!value) next.delete(key);
          else next.set(key, value);
        };

        if (patch.search !== undefined) apply('q', patch.search || null);
        if (patch.category !== undefined) apply('category', patch.category || null);
        if (patch.brand !== undefined) apply('brand', patch.brand || null);
        if (patch.minPrice !== undefined) apply('minPrice', patch.minPrice || null);
        if (patch.maxPrice !== undefined) apply('maxPrice', patch.maxPrice || null);
        if (patch.attrValues !== undefined) {
          apply('attrs', patch.attrValues.length ? patch.attrValues.join(',') : null);
        }
        if (patch.sort !== undefined) apply('sort', patch.sort === DEFAULT_SORT ? null : patch.sort);
        if (patch.view !== undefined) apply('view', patch.view === DEFAULT_VIEW ? null : patch.view);
        if (patch.page !== undefined) apply('page', patch.page <= 1 ? null : String(patch.page));
        else if (resetPage) next.delete('page');

        return next;
      });
    },
    [setSearchParams],
  );

  const apiParams = useMemo(
    () => ({
      search: params.search || undefined,
      category: params.category || undefined,
      brand: params.brand || undefined,
      productKind: defaults?.productKind,
      minPrice: params.minPrice ? Number(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
      attrValues: params.attrValues.length ? params.attrValues : undefined,
      sort: params.sort,
      page: params.page,
      limit: PAGE_SIZE,
    }),
    [params, defaults?.productKind],
  );

  return { params, updateParams, apiParams, pageSize: PAGE_SIZE };
}
