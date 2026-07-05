import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ProductAttributeDto } from '@/shared/types/api';
import { ApiError } from '@/shared/api/client';
import {
  listProductAttributeAssignments,
  listProductAttributes,
  saveProductAttributeAssignments,
} from '@/shared/api/products.api';
import { Button, Input, Label, Select } from '@/shared/ui';

interface AssignmentDraft {
  attributeId: string;
  valueText: string;
  valueNumber: string;
  valueBoolean: boolean;
  attributeValueId: string;
}

function buildDrafts(
  attributes: ProductAttributeDto[],
  assignments: Awaited<ReturnType<typeof listProductAttributeAssignments>>,
): AssignmentDraft[] {
  const specAttributes = attributes.filter((item) => !item.isVariantOption);

  return specAttributes.map((attribute) => {
    const existing = assignments.find(
      (item) => item.attributeId === attribute.id,
    );

    return {
      attributeId: attribute.id,
      valueText: existing?.valueText ?? '',
      valueNumber:
        existing?.valueNumber !== null && existing?.valueNumber !== undefined
          ? String(existing.valueNumber)
          : '',
      valueBoolean: existing?.valueBoolean ?? false,
      attributeValueId: existing?.attributeValueId ?? '',
    };
  });
}

interface ProductAttributesTabProps {
  productId: string;
}

export function ProductAttributesTab({ productId }: ProductAttributesTabProps) {
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<AssignmentDraft[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const attributesQuery = useQuery({
    queryKey: ['admin', 'product-attributes'],
    queryFn: listProductAttributes,
  });

  const assignmentsQuery = useQuery({
    queryKey: ['admin', 'products', productId, 'attribute-assignments'],
    queryFn: () => listProductAttributeAssignments(productId),
    enabled: Boolean(productId),
  });

  useEffect(() => {
    if (attributesQuery.data && assignmentsQuery.data) {
      setDrafts(buildDrafts(attributesQuery.data, assignmentsQuery.data));
    }
  }, [attributesQuery.data, assignmentsQuery.data]);

  const saveMutation = useMutation({
    mutationFn: () => {
      const specAttributes =
        attributesQuery.data?.filter((item) => !item.isVariantOption) ?? [];

      const assignments = specAttributes
        .map((attribute) => {
          const draft = drafts.find((item) => item.attributeId === attribute.id);
          if (!draft) return null;

          if (attribute.type === 'TEXT') {
            if (!draft.valueText.trim()) return null;
            return {
              attributeId: attribute.id,
              valueText: draft.valueText.trim(),
            };
          }

          if (attribute.type === 'NUMBER') {
            if (!draft.valueNumber.trim()) return null;
            return {
              attributeId: attribute.id,
              valueNumber: Number(draft.valueNumber),
            };
          }

          if (attribute.type === 'BOOLEAN') {
            return {
              attributeId: attribute.id,
              valueBoolean: draft.valueBoolean,
            };
          }

          if (!draft.attributeValueId) return null;
          return {
            attributeId: attribute.id,
            attributeValueId: draft.attributeValueId,
          };
        })
        .filter(Boolean);

      return saveProductAttributeAssignments(
        productId,
        assignments as Array<{
          attributeId: string;
          valueText?: string;
          valueNumber?: number;
          valueBoolean?: boolean;
          attributeValueId?: string;
        }>,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'products', productId, 'attribute-assignments'],
      });
      queryClient.invalidateQueries({ queryKey: ['public', 'products'] });
      setMessage('Özellikler kaydedildi.');
      setErrorMessage(null);
    },
    onError: (error) => {
      setMessage(null);
      setErrorMessage(
        error instanceof ApiError ? error.message : 'Kayıt başarısız.',
      );
    },
  });

  const specAttributes =
    attributesQuery.data?.filter((item) => !item.isVariantOption) ?? [];

  if (attributesQuery.isLoading || assignmentsQuery.isLoading) {
    return <p className="text-sm text-slate-500">Yükleniyor…</p>;
  }

  if (specAttributes.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Tanımlı ürün özelliği yok. Önce Ürünler &gt; Özellikler bölümünden
        özellik ekleyin (varyant seçeneği olmayanlar burada görünür).
      </p>
    );
  }

  const updateDraft = (
    attributeId: string,
    patch: Partial<AssignmentDraft>,
  ) => {
    setDrafts((prev) =>
      prev.map((item) =>
        item.attributeId === attributeId ? { ...item, ...patch } : item,
      ),
    );
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Ürünün teknik/spec özelliklerini buradan atayın. Varyant seçenekleri
        (renk, beden) Varyantlar sekmesinden yönetilir.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {specAttributes.map((attribute) => {
          const draft = drafts.find((item) => item.attributeId === attribute.id);

          return (
            <div key={attribute.id}>
              <Label>{attribute.name}</Label>
              {attribute.type === 'TEXT' ? (
                <Input
                  value={draft?.valueText ?? ''}
                  onChange={(event) =>
                    updateDraft(attribute.id, { valueText: event.target.value })
                  }
                />
              ) : null}
              {attribute.type === 'NUMBER' ? (
                <Input
                  type="number"
                  value={draft?.valueNumber ?? ''}
                  onChange={(event) =>
                    updateDraft(attribute.id, {
                      valueNumber: event.target.value,
                    })
                  }
                />
              ) : null}
              {attribute.type === 'BOOLEAN' ? (
                <label className="mt-1 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={draft?.valueBoolean ?? false}
                    onChange={(event) =>
                      updateDraft(attribute.id, {
                        valueBoolean: event.target.checked,
                      })
                    }
                  />
                  Evet
                </label>
              ) : null}
              {attribute.type === 'SELECT' || attribute.type === 'COLOR' ? (
                <Select
                  value={draft?.attributeValueId ?? ''}
                  onChange={(event) =>
                    updateDraft(attribute.id, {
                      attributeValueId: event.target.value,
                    })
                  }
                >
                  <option value="">Seçilmedi</option>
                  {attribute.values.map((value) => (
                    <option key={value.id} value={value.id}>
                      {value.value}
                    </option>
                  ))}
                </Select>
              ) : null}
            </div>
          );
        })}
      </div>

      {message ? <p className="text-sm text-green-700">{message}</p> : null}
      {errorMessage ? (
        <p className="text-sm text-red-600">{errorMessage}</p>
      ) : null}

      <Button
        size="sm"
        disabled={saveMutation.isPending}
        onClick={() => saveMutation.mutate()}
      >
        Özellikleri kaydet
      </Button>
    </div>
  );
}
