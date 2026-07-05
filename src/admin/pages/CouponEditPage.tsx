import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CouponDto, CouponType } from '@/shared/types/api';
import { ApiError } from '@/shared/api/client';
import {
  COUPON_TYPE_LABELS,
  createCoupon,
  findCouponById,
  updateCoupon,
} from '@/shared/api/promotions.api';
import {
  AdminFormLayout,
  FormSection,
  StickyFormActions,
} from '@/admin/components/ui';
import { useAdminMutationFeedback } from '@/admin/hooks/useAdminMutationFeedback';
import { Input, Label, Select, Textarea } from '@/shared/ui';

function parseIds(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function idsToText(ids: string[]): string {
  return ids.join('\n');
}

const emptyForm = {
  code: '',
  type: 'PERCENTAGE' as CouponType,
  value: 10,
  minOrderAmount: '',
  usageLimit: '',
  usageLimitPerCustomer: '',
  startsAt: '',
  endsAt: '',
  isActive: true,
  applicableProductIds: '',
  applicableCategoryIds: '',
};

export function CouponEditPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { onSuccess, onError } = useAdminMutationFeedback();

  const [form, setForm] = useState(emptyForm);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const stateCoupon = (location.state as { coupon?: CouponDto } | null)?.coupon;

  const couponQuery = useQuery({
    queryKey: ['admin', 'coupons', id],
    queryFn: () => findCouponById(id!),
    enabled: !isNew && Boolean(id) && !stateCoupon,
    initialData: stateCoupon,
  });

  useEffect(() => {
    const coupon = couponQuery.data;
    if (coupon) {
      setForm({
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        minOrderAmount: coupon.minOrderAmount?.toString() ?? '',
        usageLimit: coupon.usageLimit?.toString() ?? '',
        usageLimitPerCustomer: coupon.usageLimitPerCustomer?.toString() ?? '',
        startsAt: coupon.startsAt?.slice(0, 16) ?? '',
        endsAt: coupon.endsAt?.slice(0, 16) ?? '',
        isActive: coupon.isActive,
        applicableProductIds: idsToText(coupon.applicableProductIds),
        applicableCategoryIds: idsToText(coupon.applicableCategoryIds),
      });
    }
  }, [couponQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        code: form.code,
        type: form.type,
        value: Number(form.value),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        usageLimitPerCustomer: form.usageLimitPerCustomer
          ? Number(form.usageLimitPerCustomer)
          : null,
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
        isActive: form.isActive,
        applicableProductIds: parseIds(form.applicableProductIds),
        applicableCategoryIds: parseIds(form.applicableCategoryIds),
      };
      if (isNew) return createCoupon(payload);
      return updateCoupon(id!, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      onSuccess(isNew ? 'Kupon oluşturuldu.' : 'Kupon güncellendi.');
      navigate('/admin/promotions/coupons');
    },
    onError: (error) => {
      const message =
        error instanceof ApiError ? error.message : 'Kayıt başarısız';
      setErrorMessage(message);
      onError(error, message);
    },
  });

  return (
    <AdminFormLayout
      title={isNew ? 'Yeni Kupon Oluştur' : 'Kupon Düzenle'}
      description="İndirim kodlarını ve kullanım kurallarını yönetin"
      backTo="/admin/promotions/coupons"
      backLabel="Kuponlar"
    >
      <FormSection title="Temel Bilgiler" description="Kupon kodu, tip ve değer">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Kod</Label>
            <Input
              value={form.code}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  code: e.target.value.toUpperCase(),
                }))
              }
              placeholder="YAZ2026"
              className="font-mono"
            />
          </div>
          <div>
            <Label>Tip</Label>
            <Select
              value={form.type}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  type: e.target.value as CouponType,
                }))
              }
            >
              {Object.entries(COUPON_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Değer</Label>
            <Input
              type="number"
              min={0}
              value={form.value}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, value: Number(e.target.value) }))
              }
            />
          </div>
          <div>
            <Label>Min. sipariş tutarı</Label>
            <Input
              type="number"
              min={0}
              value={form.minOrderAmount}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, minOrderAmount: e.target.value }))
              }
            />
          </div>
        </div>
        <label className="flex items-center gap-2.5 rounded-md border border-[rgb(var(--admin-border))] bg-[rgb(var(--admin-surface-muted))] px-3 py-2.5 text-sm">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={form.isActive}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, isActive: e.target.checked }))
            }
          />
          <span className="font-medium">Kupon aktif</span>
        </label>
      </FormSection>

      <FormSection title="Kullanım ve Geçerlilik" description="Limitler ve tarih aralığı">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Başlangıç</Label>
            <Input
              type="datetime-local"
              value={form.startsAt}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, startsAt: e.target.value }))
              }
            />
          </div>
          <div>
            <Label>Bitiş</Label>
            <Input
              type="datetime-local"
              value={form.endsAt}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, endsAt: e.target.value }))
              }
            />
          </div>
          <div>
            <Label>Toplam kullanım limiti</Label>
            <Input
              type="number"
              min={1}
              value={form.usageLimit}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, usageLimit: e.target.value }))
              }
            />
          </div>
          <div>
            <Label>Müşteri başına limit</Label>
            <Input
              type="number"
              min={1}
              value={form.usageLimitPerCustomer}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  usageLimitPerCustomer: e.target.value,
                }))
              }
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Kapsam" description="Belirli ürün veya kategorilerle sınırla">
        <div>
          <Label>Ürün ID'leri (satır veya virgülle)</Label>
          <Textarea
            rows={3}
            value={form.applicableProductIds}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                applicableProductIds: e.target.value,
              }))
            }
          />
        </div>
        <div>
          <Label>Kategori ID'leri (satır veya virgülle)</Label>
          <Textarea
            rows={3}
            value={form.applicableCategoryIds}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                applicableCategoryIds: e.target.value,
              }))
            }
          />
        </div>
      </FormSection>

      {errorMessage ? (
        <p className="text-sm text-red-600">{errorMessage}</p>
      ) : null}

      <StickyFormActions
        onCancel={() => navigate('/admin/promotions/coupons')}
        onSave={() => saveMutation.mutate()}
        isSaving={saveMutation.isPending}
        saveLabel={isNew ? 'Kuponu oluştur' : 'Değişiklikleri kaydet'}
      />
    </AdminFormLayout>
  );
}
