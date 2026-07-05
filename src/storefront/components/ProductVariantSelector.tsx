import { useMemo, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { uiLabel, uiLabelFormat } from '@/shared/lib/storefront-ui';
import type {
  PublicProductVariantDto,
  PublicVariantAttributeDto,
} from '@/shared/types/api';
import { useStorefrontUi } from '@/storefront/hooks/useStorefrontUi';

interface ProductVariantSelectorProps {
  variantAttributes: PublicVariantAttributeDto[];
  variants: PublicProductVariantDto[];
  onVariantChange?: (variant: PublicProductVariantDto | null) => void;
}

function findMatchingVariant(
  variants: PublicProductVariantDto[],
  selected: Record<string, string>,
): PublicProductVariantDto | null {
  return (
    variants.find((variant) =>
      variant.options.every(
        (option) => selected[option.attributeId] === option.attributeValueId,
      ),
    ) ?? null
  );
}

export function ProductVariantSelector({
  variantAttributes,
  variants,
  onVariantChange,
}: ProductVariantSelectorProps) {
  const ui = useStorefrontUi();
  const productVariantOutOfStock = uiLabel(ui, 'productVariantOutOfStock');
  const productVariantUnavailable = uiLabel(ui, 'productVariantUnavailable');

  const initialSelection = useMemo(() => {
    const first = variants[0];
    if (!first) return {};

    return Object.fromEntries(
      first.options.map((option) => [
        option.attributeId,
        option.attributeValueId,
      ]),
    );
  }, [variants]);

  const [selected, setSelected] =
    useState<Record<string, string>>(initialSelection);

  const activeVariant = useMemo(
    () => findMatchingVariant(variants, selected),
    [variants, selected],
  );

  const handleSelect = (attributeId: string, valueId: string) => {
    const next = { ...selected, [attributeId]: valueId };
    setSelected(next);
    onVariantChange?.(findMatchingVariant(variants, next));
  };

  if (variantAttributes.length === 0 || variants.length === 0) {
    return null;
  }

  const stockMessage = activeVariant
    ? activeVariant.stockQuantity !== null &&
      activeVariant.stockQuantity <= 0
      ? productVariantOutOfStock
      : activeVariant.stockQuantity !== null
        ? uiLabelFormat(ui, 'productVariantStock', {
            qty: activeVariant.stockQuantity,
          })
        : null
    : productVariantUnavailable;

  return (
    <div className="mt-6 space-y-4">
      {variantAttributes.map((attribute) => (
        <div key={attribute.attributeId}>
          <p className="text-sm font-medium text-slate-700">{attribute.name}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {attribute.values.map((value) => {
              const isSelected =
                selected[attribute.attributeId] === value.id;
              const isColor = attribute.type === 'COLOR' && value.colorHex;

              return (
                <button
                  key={value.id}
                  type="button"
                  onClick={() =>
                    handleSelect(attribute.attributeId, value.id)
                  }
                  className={cn(
                    'rounded-md border px-3 py-1.5 text-sm transition-colors',
                    isSelected
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400',
                  )}
                  aria-pressed={isSelected}
                >
                  <span className="inline-flex items-center gap-2">
                    {isColor ? (
                      <span
                        className="inline-block h-4 w-4 rounded-full border border-slate-300"
                        style={{ backgroundColor: value.colorHex! }}
                        aria-hidden
                      />
                    ) : null}
                    {value.value}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {stockMessage ? (
        <p
          className={cn(
            'text-xs',
            activeVariant ? 'text-theme-muted' : 'text-red-600',
          )}
        >
          {stockMessage}
        </p>
      ) : null}
    </div>
  );
}

export function getVariantDisplayPrice(
  variant: PublicProductVariantDto | null,
  fallback: number | null,
): number | null {
  if (!variant) return fallback;
  return variant.salePrice ?? variant.price ?? fallback;
}

export function getVariantDisplayImage(
  variant: PublicProductVariantDto | null,
  fallback: string | null,
): string | null {
  return variant?.imageUrl ?? fallback;
}
