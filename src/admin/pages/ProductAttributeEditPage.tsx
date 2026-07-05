import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ProductAttributeType } from '@/shared/types/api';
import { ApiError } from '@/shared/api/client';
import {
  createProductAttribute,
  getProductAttribute,
  PRODUCT_ATTRIBUTE_TYPE_LABELS,
  updateProductAttribute,
} from '@/shared/api/products.api';
import {
  AdminFormLayout,
  FormSection,
  StickyFormActions,
} from '@/admin/components/ui';
import { useAdminMutationFeedback } from '@/admin/hooks/useAdminMutationFeedback';
import { Input, Label, Select } from '@/shared/ui';

export function ProductAttributeEditPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { onSuccess, onError } = useAdminMutationFeedback();

  const [form, setForm] = useState({
    name: '',
    code: '',
    type: 'TEXT' as ProductAttributeType,
    isFilterable: false,
    isVariantOption: false,
    sortOrder: 0,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const attributeQuery = useQuery({
    queryKey: ['admin', 'product-attributes', id],
    queryFn: () => getProductAttribute(id!),
    enabled: !isNew && Boolean(id),
  });

  useEffect(() => {
    const attribute = attributeQuery.data;
    if (attribute) {
      setForm({
        name: attribute.name,
        code: attribute.code,
        type: attribute.type,
        isFilterable: attribute.isFilterable,
        isVariantOption: attribute.isVariantOption,
        sortOrder: attribute.sortOrder,
      });
    }
  }, [attributeQuery.data]);

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        name: form.name,
        code: form.code,
        type: form.type,
        isFilterable: form.isFilterable,
        isVariantOption: form.isVariantOption,
        sortOrder: form.sortOrder,
      };
      return isNew
        ? createProductAttribute(payload)
        : updateProductAttribute(id!, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'product-attributes'] });
      onSuccess(isNew ? 'Özellik oluşturuldu.' : 'Özellik güncellendi.');
      navigate('/admin/products/attributes');
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
      title={isNew ? 'Yeni Özellik' : 'Özellik Düzenle'}
      description="Ürün özellik tanımlarını ve varyant seçeneklerini yönetin"
      backTo="/admin/products/attributes"
      backLabel="Özellikler"
    >
      <FormSection title="Özellik Tanımı">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Ad</Label>
            <Input
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>
          <div>
            <Label>Kod</Label>
            <Input
              value={form.code}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  code: e.target.value.toLowerCase().replace(/\s+/g, '_'),
                }))
              }
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
                  type: e.target.value as ProductAttributeType,
                }))
              }
            >
              {Object.entries(PRODUCT_ATTRIBUTE_TYPE_LABELS).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ),
              )}
            </Select>
          </div>
          <div>
            <Label>Sıra</Label>
            <Input
              type="number"
              value={form.sortOrder}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  sortOrder: Number(e.target.value),
                }))
              }
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              checked={form.isFilterable}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  isFilterable: e.target.checked,
                }))
              }
            />
            <span>Filtrelemede kullan</span>
          </label>
          <label className="flex items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              checked={form.isVariantOption}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  isVariantOption: e.target.checked,
                }))
              }
            />
            <span>Varyant seçeneği olarak kullan</span>
          </label>
        </div>
      </FormSection>

      {errorMessage ? (
        <p className="text-sm text-red-600">{errorMessage}</p>
      ) : null}

      <StickyFormActions
        onCancel={() => navigate('/admin/products/attributes')}
        onSave={() => saveMutation.mutate()}
        isSaving={saveMutation.isPending}
      />
    </AdminFormLayout>
  );
}
