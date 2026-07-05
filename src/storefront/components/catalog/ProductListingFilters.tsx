import type { FilterableAttributeDto, PublicProductCategoryDto } from '@/shared/types/api';
import { uiLabel } from '@/shared/lib/storefront-ui';
import type { ProductListingParams } from '@/storefront/hooks/useProductListingParams';
import { useStorefrontUi } from '@/storefront/hooks/useStorefrontUi';

interface BrandOption {
  id: string;
  name: string;
  slug: string;
  productCount?: number;
}

interface ProductListingFiltersProps {
  params: ProductListingParams;
  categories: PublicProductCategoryDto[];
  brands: BrandOption[];
  filterAttributes: FilterableAttributeDto[];
  onChange: (patch: Partial<ProductListingParams>) => void;
  lockCategory?: string;
  lockBrand?: string;
}

export function ProductListingFilters({
  params,
  categories,
  brands,
  filterAttributes,
  onChange,
  lockCategory,
  lockBrand,
}: ProductListingFiltersProps) {
  const ui = useStorefrontUi();
  const catalogSearchLabel = uiLabel(ui, 'catalogSearchLabel');
  const catalogSearchPlaceholder = uiLabel(ui, 'catalogSearchPlaceholder');
  const catalogCategoryLabel = uiLabel(ui, 'catalogCategoryLabel');
  const catalogAllOption = uiLabel(ui, 'catalogAllOption');
  const catalogBrandLabel = uiLabel(ui, 'catalogBrandLabel');
  const catalogPriceRangeLabel = uiLabel(ui, 'catalogPriceRangeLabel');
  const catalogPriceMin = uiLabel(ui, 'catalogPriceMin');
  const catalogPriceMax = uiLabel(ui, 'catalogPriceMax');

  const toggleAttrValue = (valueId: string, attributeId: string) => {
    const attribute = filterAttributes.find((item) => item.id === attributeId);
    const siblingIds = new Set(attribute?.values.map((item) => item.id));
    const withoutSiblings = params.attrValues.filter(
      (id) => !siblingIds.has(id),
    );
    const isSelected = params.attrValues.includes(valueId);
    onChange({
      attrValues: isSelected
        ? withoutSiblings
        : [...withoutSiblings, valueId],
    });
  };

  return (
    <div className="space-y-6">
      {catalogSearchLabel ? (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            {catalogSearchLabel}
          </label>
          <input
            type="search"
            value={params.search}
            onChange={(event) => onChange({ search: event.target.value })}
            placeholder={catalogSearchPlaceholder ?? ''}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
      ) : null}

      {!lockCategory && catalogCategoryLabel ? (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            {catalogCategoryLabel}
          </label>
          <select
            value={params.category}
            onChange={(event) => onChange({ category: event.target.value })}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          >
            {catalogAllOption ? <option value="">{catalogAllOption}</option> : null}
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
                {category.productCount !== undefined
                  ? ` (${category.productCount})`
                  : ''}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {!lockBrand && catalogBrandLabel ? (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            {catalogBrandLabel}
          </label>
          <select
            value={params.brand}
            onChange={(event) => onChange({ brand: event.target.value })}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          >
            {catalogAllOption ? <option value="">{catalogAllOption}</option> : null}
            {brands.map((brand) => (
              <option key={brand.id} value={brand.slug}>
                {brand.name}
                {brand.productCount !== undefined
                  ? ` (${brand.productCount})`
                  : ''}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {(catalogPriceRangeLabel || catalogPriceMin || catalogPriceMax) && (
        <div>
          {catalogPriceRangeLabel ? (
            <p className="mb-2 text-sm font-medium text-slate-700">
              {catalogPriceRangeLabel}
            </p>
          ) : null}
          <div className="flex gap-2">
            {catalogPriceMin ? (
              <input
                type="number"
                min={0}
                placeholder={catalogPriceMin}
                value={params.minPrice}
                onChange={(event) => onChange({ minPrice: event.target.value })}
                className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
              />
            ) : null}
            {catalogPriceMax ? (
              <input
                type="number"
                min={0}
                placeholder={catalogPriceMax}
                value={params.maxPrice}
                onChange={(event) => onChange({ maxPrice: event.target.value })}
                className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
              />
            ) : null}
          </div>
        </div>
      )}

      {filterAttributes.map((attribute) => (
        <div key={attribute.id}>
          <p className="mb-2 text-sm font-medium text-slate-700">
            {attribute.name}
          </p>
          <div className="space-y-1">
            {attribute.values.map((value) => (
              <label
                key={value.id}
                className="flex cursor-pointer items-center gap-2 text-sm text-slate-600"
              >
                <input
                  type="checkbox"
                  checked={params.attrValues.includes(value.id)}
                  onChange={() => toggleAttrValue(value.id, attribute.id)}
                />
                {attribute.type === 'COLOR' && value.colorHex ? (
                  <span
                    className="inline-block h-3.5 w-3.5 rounded-full border"
                    style={{ backgroundColor: value.colorHex }}
                  />
                ) : null}
                {value.value}
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
