import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { CouponDto, CouponType } from '@/shared/types/api';
import { ApiError } from '@/shared/api/client';
import {
  COUPON_TYPE_LABELS,
  createCoupon,
  deleteCoupon,
  listCoupons,
  updateCoupon,
} from '@/shared/api/promotions.api';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Input,
  Label,
  Modal,
  Select,
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeaderCell,
  TableRow,
  Textarea,
} from '@/shared/ui';

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

export function CouponsPage() {
  const queryClient = useQueryClient();
  const formModal = useDisclosure();
  const [selected, setSelected] = useState<CouponDto | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const couponsQuery = useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn: listCoupons,
  });

  useEffect(() => {
    if (selected) {
      setForm({
        code: selected.code,
        type: selected.type,
        value: selected.value,
        minOrderAmount: selected.minOrderAmount?.toString() ?? '',
        usageLimit: selected.usageLimit?.toString() ?? '',
        usageLimitPerCustomer: selected.usageLimitPerCustomer?.toString() ?? '',
        startsAt: selected.startsAt?.slice(0, 16) ?? '',
        endsAt: selected.endsAt?.slice(0, 16) ?? '',
        isActive: selected.isActive,
        applicableProductIds: idsToText(selected.applicableProductIds),
        applicableCategoryIds: idsToText(selected.applicableCategoryIds),
      });
    } else {
      setForm(emptyForm);
    }
  }, [selected, formModal.isOpen]);

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
      if (selected) return updateCoupon(selected.id, payload);
      return createCoupon(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      formModal.close();
      setSelected(null);
      setErrorMessage(null);
    },
    onError: (error) => {
      setErrorMessage(error instanceof ApiError ? error.message : 'Kayıt başarısız');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    },
  });

  return (
    <>
      <Card padding="sm">
        <CardHeader
          title="Kuponlar"
          description="Sepet ve checkout'ta kullanılabilecek indirim kodları"
          action={
            <Button
              size="sm"
              onClick={() => {
                setSelected(null);
                formModal.open();
              }}
            >
              <Plus className="mr-1 h-4 w-4" />
              Yeni kupon
            </Button>
          }
        />

        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Kod</TableHeaderCell>
              <TableHeaderCell>Tip</TableHeaderCell>
              <TableHeaderCell>Değer</TableHeaderCell>
              <TableHeaderCell>Durum</TableHeaderCell>
              <TableHeaderCell className="text-right">İşlem</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {couponsQuery.isLoading ? (
              <TableEmpty colSpan={5} message="Yükleniyor…" />
            ) : (couponsQuery.data?.length ?? 0) === 0 ? (
              <TableEmpty colSpan={5} message="Henüz kupon yok." />
            ) : (
              couponsQuery.data!.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-mono">{coupon.code}</TableCell>
                  <TableCell>{COUPON_TYPE_LABELS[coupon.type]}</TableCell>
                  <TableCell>
                    {coupon.type === 'PERCENTAGE'
                      ? `%${coupon.value}`
                      : `${coupon.value} TL`}
                  </TableCell>
                  <TableCell>
                    <Badge variant={coupon.isActive ? 'success' : 'default'}>
                      {coupon.isActive ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelected(coupon);
                          formModal.open();
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (window.confirm('Kupon silinsin mi?')) {
                            deleteMutation.mutate(coupon.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Modal
        isOpen={formModal.isOpen}
        onClose={formModal.close}
        title={selected ? 'Kupon düzenle' : 'Yeni kupon'}
        size="lg"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Kod</Label>
            <Input
              value={form.code}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))
              }
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
          <div className="sm:col-span-2">
            <Label>Ürün ID'leri (satır veya virgülle)</Label>
            <Textarea
              rows={2}
              value={form.applicableProductIds}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  applicableProductIds: e.target.value,
                }))
              }
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Kategori ID'leri (satır veya virgülle)</Label>
            <Textarea
              rows={2}
              value={form.applicableCategoryIds}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  applicableCategoryIds: e.target.value,
                }))
              }
            />
          </div>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, isActive: e.target.checked }))
              }
            />
            Aktif
          </label>
        </div>
        {errorMessage ? (
          <p className="mt-3 text-sm text-red-600">{errorMessage}</p>
        ) : null}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={formModal.close}>
            İptal
          </Button>
          <Button
            disabled={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            Kaydet
          </Button>
        </div>
      </Modal>
    </>
  );
}
