import type { FilterableAttributeDto, PublicProductCategoryDto } from '@/shared/types/api';
import type { ProductListingParams } from '@/storefront/hooks/useProductListingParams';

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
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Ara
        </label>
        <input
          type="search"
          value={params.search}
          onChange={(event) => onChange({ search: event.target.value })}
          placeholder="Ürün ara…"
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
        />
      </div>

      {!lockCategory ? (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Kategori
          </label>
          <select
            value={params.category}
            onChange={(event) => onChange({ category: event.target.value })}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">Tümü</option>
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

      {!lockBrand ? (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Marka
          </label>
          <select
            value={params.brand}
            onChange={(event) => onChange({ brand: event.target.value })}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">Tümü</option>
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

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Fiyat aralığı</p>
        <div className="flex gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={params.minPrice}
            onChange={(event) => onChange({ minPrice: event.target.value })}
            className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
          />
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={params.maxPrice}
            onChange={(event) => onChange({ maxPrice: event.target.value })}
            className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
          />
        </div>
      </div>

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
