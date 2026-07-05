import { cn } from '@/shared/lib/cn';
import {
  PRODUCT_PRESETS,
  type ProductPresetId,
} from '@/admin/config/productPresets';

interface ProductPresetSelectorProps {
  value: ProductPresetId;
  onChange: (presetId: ProductPresetId) => void;
}

export function ProductPresetSelector({
  value,
  onChange,
}: ProductPresetSelectorProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {PRODUCT_PRESETS.map((preset) => {
        const selected = value === preset.id;
        return (
          <button
            key={preset.id}
            type="button"
            onClick={() => onChange(preset.id)}
            className={cn(
              'rounded-lg border p-4 text-left transition-all',
              selected
                ? 'border-[rgb(var(--admin-primary))] bg-[rgb(var(--admin-primary))]/5 shadow-[var(--admin-shadow-sm)]'
                : 'border-[rgb(var(--admin-border))] bg-[rgb(var(--admin-surface))] hover:border-[rgb(var(--admin-primary))]/40',
            )}
          >
            <p className="text-sm font-semibold text-[rgb(var(--admin-text))]">
              {preset.label}
            </p>
            <p className="mt-1 text-xs text-[rgb(var(--admin-text-muted))]">
              {preset.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}
