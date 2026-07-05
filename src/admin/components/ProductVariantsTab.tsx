import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import type { ProductVariantDto } from '@/shared/types/api';
import { ApiError } from '@/shared/api/client';
import {
  deleteProductVariant,
  generateProductVariants,
  listProductAttributes,
  listProductVariants,
  updateProductVariant,
} from '@/shared/api/products.api';
import {
  Button,
  Input,
  MediaField,
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/shared/ui';

function variantLabel(variant: ProductVariantDto) {
  return variant.options.map((option) => option.attributeValue.value).join(' / ');
}

interface ProductVariantsTabProps {
  productId: string;
}

export function ProductVariantsTab({ productId }: ProductVariantsTabProps) {
  const queryClient = useQueryClient();
  const [selections, setSelections] = useState<
    Record<string, Set<string>>
  >({});
  const [edits, setEdits] = useState<
    Record<
      string,
      {
        sku: string;
        price: string;
        salePrice: string;
        stockQuantity: string;
        imageId: string | null;
        isActive: boolean;
      }
    >
  >({});
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const attributesQuery = useQuery({
    queryKey: ['admin', 'product-attributes'],
    queryFn: listProductAttributes,
  });

  const variantsQuery = useQuery({
    queryKey: ['admin', 'products', productId, 'variants'],
    queryFn: () => listProductVariants(productId),
    enabled: Boolean(productId),
  });

  const variantAttributes =
    attributesQuery.data?.filter((item) => item.isVariantOption) ?? [];

  useEffect(() => {
    if (variantsQuery.data) {
      const next: typeof edits = {};
      for (const variant of variantsQuery.data) {
        next[variant.id] = {
          sku: variant.sku ?? '',
          price: variant.price !== null ? String(variant.price) : '',
          salePrice:
            variant.salePrice !== null ? String(variant.salePrice) : '',
          stockQuantity:
            variant.stockQuantity !== null
              ? String(variant.stockQuantity)
              : '',
          imageId: variant.imageId,
          isActive: variant.isActive,
        };
      }
      setEdits(next);
    }
  }, [variantsQuery.data]);

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: ['admin', 'products', productId, 'variants'],
    });
    queryClient.invalidateQueries({ queryKey: ['public', 'products'] });
  };

  const generateMutation = useMutation({
    mutationFn: () => {
      const payload = variantAttributes
        .map((attribute) => ({
          attributeId: attribute.id,
          valueIds: [...(selections[attribute.id] ?? [])],
        }))
        .filter((item) => item.valueIds.length > 0);

      if (payload.length === 0) {
        throw new Error('En az bir varyant seçeneği işaretleyin.');
      }

      return generateProductVariants(productId, payload);
    },
    onSuccess: (data) => {
      invalidate();
      setMessage(`${data.created.length} yeni varyant oluşturuldu.`);
      setErrorMessage(null);
    },
    onError: (error) => {
      setMessage(null);
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Oluşturma başarısız.',
      );
    },
  });

  const saveVariantMutation = useMutation({
    mutationFn: (variantId: string) => {
      const edit = edits[variantId];
      return updateProductVariant(productId, variantId, {
        sku: edit.sku || null,
        price: edit.price ? Number(edit.price) : null,
        salePrice: edit.salePrice ? Number(edit.salePrice) : null,
        stockQuantity: edit.stockQuantity
          ? Number(edit.stockQuantity)
          : null,
        imageId: edit.imageId,
        isActive: edit.isActive,
      });
    },
    onSuccess: () => {
      invalidate();
      setMessage('Varyant kaydedildi.');
      setErrorMessage(null);
    },
    onError: (error) => {
      setMessage(null);
      setErrorMessage(
        error instanceof ApiError ? error.message : 'Kayıt başarısız.',
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (variantId: string) =>
      deleteProductVariant(productId, variantId),
    onSuccess: () => {
      invalidate();
      setMessage('Varyant silindi.');
      setErrorMessage(null);
    },
  });

  const toggleValue = (attributeId: string, valueId: string) => {
    setSelections((prev) => {
      const current = new Set(prev[attributeId] ?? []);
      if (current.has(valueId)) {
        current.delete(valueId);
      } else {
        current.add(valueId);
      }
      return { ...prev, [attributeId]: current };
    });
  };

  const updateEdit = (
    variantId: string,
    patch: Partial<(typeof edits)[string]>,
  ) => {
    setEdits((prev) => ({
      ...prev,
      [variantId]: { ...prev[variantId], ...patch },
    }));
  };

  if (attributesQuery.isLoading || variantsQuery.isLoading) {
    return <p className="text-sm text-slate-500">Yükleniyor…</p>;
  }

  if (variantAttributes.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Varyant seçeneği tanımlı değil. Önce Ürünler &gt; Özellikler bölümünden
        &quot;Varyant seçeneği&quot; işaretli özellikler (renk, beden vb.)
        oluşturun.
      </p>
    );
  }

  const variants = variantsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 p-4">
        <h3 className="text-sm font-medium text-slate-800">
          Otomatik kombinasyon üret
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Her varyant özelliği için kullanılacak değerleri seçin; tüm
          kombinasyonlar otomatik oluşturulur.
        </p>

        <div className="mt-4 space-y-4">
          {variantAttributes.map((attribute) => (
            <div key={attribute.id}>
              <p className="text-sm font-medium">{attribute.name}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {attribute.values.map((value) => {
                  const checked = selections[attribute.id]?.has(value.id);
                  return (
                    <label
                      key={value.id}
                      className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 px-2 py-1 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={checked ?? false}
                        onChange={() => toggleValue(attribute.id, value.id)}
                      />
                      {attribute.type === 'COLOR' && value.colorHex ? (
                        <span
                          className="inline-block h-4 w-4 rounded-full border"
                          style={{ backgroundColor: value.colorHex }}
                        />
                      ) : null}
                      {value.value}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <Button
          size="sm"
          className="mt-4"
          disabled={generateMutation.isPending}
          onClick={() => generateMutation.mutate()}
        >
          Kombinasyonları oluştur
        </Button>
      </div>

      {message ? <p className="text-sm text-green-700">{message}</p> : null}
      {errorMessage ? (
        <p className="text-sm text-red-600">{errorMessage}</p>
      ) : null}

      <div>
        <h3 className="mb-2 text-sm font-medium text-slate-800">
          Varyantlar ({variants.length})
        </h3>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Kombinasyon</TableHeaderCell>
              <TableHeaderCell>SKU</TableHeaderCell>
              <TableHeaderCell>Fiyat</TableHeaderCell>
              <TableHeaderCell>İnd. fiyat</TableHeaderCell>
              <TableHeaderCell>Stok</TableHeaderCell>
              <TableHeaderCell>Görsel</TableHeaderCell>
              <TableHeaderCell>Aktif</TableHeaderCell>
              <TableHeaderCell className="text-right">İşlem</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {variants.length === 0 ? (
              <TableEmpty colSpan={8} message="Henüz varyant yok." />
            ) : (
              variants.map((variant) => {
                const edit = edits[variant.id];
                return (
                  <TableRow key={variant.id}>
                    <TableCell className="whitespace-nowrap text-sm">
                      {variantLabel(variant)}
                    </TableCell>
                    <TableCell>
                      <Input
                        className="min-w-[100px]"
                        value={edit?.sku ?? ''}
                        onChange={(event) =>
                          updateEdit(variant.id, { sku: event.target.value })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        className="min-w-[90px]"
                        value={edit?.price ?? ''}
                        onChange={(event) =>
                          updateEdit(variant.id, { price: event.target.value })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        className="min-w-[90px]"
                        value={edit?.salePrice ?? ''}
                        onChange={(event) =>
                          updateEdit(variant.id, {
                            salePrice: event.target.value,
                          })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        className="min-w-[70px]"
                        value={edit?.stockQuantity ?? ''}
                        onChange={(event) =>
                          updateEdit(variant.id, {
                            stockQuantity: event.target.value,
                          })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <MediaField
                        label=""
                        value={edit?.imageId ?? null}
                        onChange={(value) =>
                          updateEdit(variant.id, { imageId: value })
                        }
                        folder="products"
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={edit?.isActive ?? true}
                        onChange={(event) =>
                          updateEdit(variant.id, {
                            isActive: event.target.checked,
                          })
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={saveVariantMutation.isPending}
                          onClick={() => saveVariantMutation.mutate(variant.id)}
                        >
                          Kaydet
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={deleteMutation.isPending}
                          onClick={() => deleteMutation.mutate(variant.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
