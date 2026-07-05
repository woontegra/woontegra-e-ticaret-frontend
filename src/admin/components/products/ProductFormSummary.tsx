import type { ProductDto } from '@/shared/types/api';
import { DELIVERY_MODE_LABELS } from '@/shared/api/products.api';
import { FormSection } from '@/admin/components/ui';
import {
  formatProductPrice,
  getProductBadges,
  getProductDeliveryStatusLabel,
  getProductLicenseStatusLabel,
  getProductSaleStatusLabel,
  PRODUCT_BADGE_LABELS,
} from '@/admin/lib/productAdminDisplay';
import { Badge } from '@/shared/ui';

interface ProductFormSummaryProps {
  form: Partial<ProductDto>;
  warnings: string[];
}

export function ProductFormSummary({ form, warnings }: ProductFormSummaryProps) {
  const badges = form.deliveryMode
    ? getProductBadges(form as ProductDto)
    : [];

  return (
    <FormSection title="Özet" description="Ürün durumu ve eksik alanlar">
      <div className="space-y-4">
        {form.mainImageUrl ? (
          <img
            src={form.mainImageUrl}
            alt={form.name ?? 'Kapak'}
            className="aspect-video w-full rounded-md border border-[rgb(var(--admin-border))] object-cover"
          />
        ) : (
          <div className="flex aspect-video items-center justify-center rounded-md border border-dashed border-[rgb(var(--admin-border))] bg-[rgb(var(--admin-surface-muted))] text-xs text-[rgb(var(--admin-text-muted))]">
            Kapak görseli yok
          </div>
        )}

        <div>
          <p className="text-sm font-semibold text-[rgb(var(--admin-text))]">
            {form.name || 'Ürün adı'}
          </p>
          <p className="text-xs text-[rgb(var(--admin-text-muted))]">
            {form.slug || 'slug-bekleniyor'}
          </p>
        </div>

        <dl className="space-y-2 text-xs">
          <div className="flex justify-between gap-2">
            <dt className="text-[rgb(var(--admin-text-muted))]">Fiyat</dt>
            <dd className="font-medium">
              {form.name ? formatProductPrice(form as ProductDto) : '—'}
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-[rgb(var(--admin-text-muted))]">Satış</dt>
            <dd>{form.name ? getProductSaleStatusLabel(form as ProductDto) : '—'}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-[rgb(var(--admin-text-muted))]">Teslimat</dt>
            <dd>
              {form.deliveryMode
                ? DELIVERY_MODE_LABELS[form.deliveryMode]
                : '—'}
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-[rgb(var(--admin-text-muted))]">Lisans</dt>
            <dd className="truncate text-right">
              {form.name ? getProductLicenseStatusLabel(form as ProductDto) : '—'}
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-[rgb(var(--admin-text-muted))]">Teslimat detay</dt>
            <dd className="text-right">
              {form.name ? getProductDeliveryStatusLabel(form as ProductDto) : '—'}
            </dd>
          </div>
        </dl>

        {badges.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {badges.map((badge) => (
              <Badge key={badge} variant="default">
                {PRODUCT_BADGE_LABELS[badge]}
              </Badge>
            ))}
          </div>
        ) : null}

        {warnings.length > 0 ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs font-medium text-amber-900">Eksik alanlar</p>
            <ul className="mt-1 list-inside list-disc text-xs text-amber-800">
              {warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </FormSection>
  );
}
