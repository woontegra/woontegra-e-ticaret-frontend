import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react';
import type { ProductAttributeDto } from '@/shared/types/api';
import { ApiError } from '@/shared/api/client';
import {
  createProductAttributeValue,
  deleteProductAttribute,
  deleteProductAttributeValue,
  listProductAttributes,
  PRODUCT_ATTRIBUTE_TYPE_LABELS,
  updateProductAttributeValue,
} from '@/shared/api/products.api';
import { ListPageShell } from '@/admin/components/ui';
import { TableQueryState } from '@/admin/components/TableQueryState';
import { useAdminMutationFeedback } from '@/admin/hooks/useAdminMutationFeedback';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import {
  Badge,
  Button,
  ConfirmDialog,
  FilterBar,
  Input,
  Label,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/shared/ui';

function emptyValueForm() {
  return {
    value: '',
    colorHex: '',
    sortOrder: 0,
  };
}

export function ProductAttributesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { onSuccess, onError } = useAdminMutationFeedback();
  const [search, setSearch] = useState('');
  const valueModal = useDisclosure();
  const deleteAttributeModal = useDisclosure();
  const deleteValueModal = useDisclosure();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [valueForm, setValueForm] = useState(emptyValueForm());
  const [valueAttributeId, setValueAttributeId] = useState<string | null>(null);
  const [selectedValueId, setSelectedValueId] = useState<string | null>(null);
  const [toDeleteAttribute, setToDeleteAttribute] =
    useState<ProductAttributeDto | null>(null);
  const [toDeleteValue, setToDeleteValue] = useState<{
    attributeId: string;
    valueId: string;
    label: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const attributesQuery = useQuery({
    queryKey: ['admin', 'product-attributes'],
    queryFn: listProductAttributes,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['admin', 'product-attributes'] });

  const openCreateValue = (attributeId: string) => {
    setValueAttributeId(attributeId);
    setSelectedValueId(null);
    setValueForm(emptyValueForm());
    setErrorMessage(null);
    valueModal.open();
  };

  const openEditValue = (
    attributeId: string,
    value: ProductAttributeDto['values'][number],
  ) => {
    setValueAttributeId(attributeId);
    setSelectedValueId(value.id);
    setValueForm({
      value: value.value,
      colorHex: value.colorHex ?? '',
      sortOrder: value.sortOrder,
    });
    setErrorMessage(null);
    valueModal.open();
  };

  const saveValueMutation = useMutation({
    mutationFn: () => {
      const payload = {
        value: valueForm.value,
        colorHex: valueForm.colorHex || null,
        sortOrder: valueForm.sortOrder,
      };

      if (!valueAttributeId) throw new Error('Attribute required');

      return selectedValueId
        ? updateProductAttributeValue(valueAttributeId, selectedValueId, payload)
        : createProductAttributeValue(valueAttributeId, payload);
    },
    onSuccess: () => {
      invalidate();
      valueModal.close();
      setErrorMessage(null);
    },
    onError: (error) => {
      setErrorMessage(
        error instanceof ApiError ? error.message : 'Kayıt başarısız',
      );
    },
  });

  const deleteAttributeMutation = useMutation({
    mutationFn: () => deleteProductAttribute(toDeleteAttribute!.id),
    onSuccess: () => {
      invalidate();
      deleteAttributeModal.close();
      setToDeleteAttribute(null);
      onSuccess('Özellik silindi.');
    },
    onError: (error) => onError(error, 'Özellik silinemedi.'),
  });

  const deleteValueMutation = useMutation({
    mutationFn: () =>
      deleteProductAttributeValue(toDeleteValue!.attributeId, toDeleteValue!.valueId),
    onSuccess: () => {
      invalidate();
      deleteValueModal.close();
      setToDeleteValue(null);
      onSuccess('Değer silindi.');
    },
    onError: (error) => onError(error, 'Değer silinemedi.'),
  });

  const attributes = useMemo(() => {
    const items = attributesQuery.data ?? [];
    if (!search.trim()) return items;
    const q = search.trim().toLowerCase();
    return items.filter(
      (attribute) =>
        attribute.name.toLowerCase().includes(q) ||
        attribute.code.toLowerCase().includes(q),
    );
  }, [attributesQuery.data, search]);

  return (
    <>
      <ListPageShell
        title="Özellikler"
        description="Ürün özellik tanımlarını ve varyant seçeneklerini yönetin"
        actions={
          <Button
            size="sm"
            onClick={() => navigate('/admin/products/attributes/new')}
          >
            <Plus className="h-4 w-4" />
            Yeni özellik
          </Button>
        }
        filters={
          <FilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Ad veya kod ara…"
          />
        }
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell className="w-8" />
              <TableHeaderCell>Ad</TableHeaderCell>
              <TableHeaderCell>Kod</TableHeaderCell>
              <TableHeaderCell>Tür</TableHeaderCell>
              <TableHeaderCell>Etiketler</TableHeaderCell>
              <TableHeaderCell className="text-right">İşlem</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableQueryState
              colSpan={6}
              isLoading={attributesQuery.isLoading}
              isError={attributesQuery.isError}
              isEmpty={attributes.length === 0}
              emptyMessage="Henüz özellik tanımlanmadı."
            >
              {attributes.flatMap((attribute) => {
                const isExpanded = expandedId === attribute.id;
                const rows = [
                  <TableRow key={attribute.id}>
                    <TableCell>
                      <button
                        type="button"
                        className="text-slate-500"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : attribute.id)
                        }
                        aria-label={isExpanded ? 'Daralt' : 'Genişlet'}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    </TableCell>
                    <TableCell>{attribute.name}</TableCell>
                    <TableCell className="text-slate-500">{attribute.code}</TableCell>
                    <TableCell>
                      {PRODUCT_ATTRIBUTE_TYPE_LABELS[attribute.type]}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {attribute.isFilterable ? (
                          <Badge>Filtrelenebilir</Badge>
                        ) : null}
                        {attribute.isVariantOption ? (
                          <Badge variant="success">Varyant</Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            navigate(`/admin/products/attributes/${attribute.id}`)
                          }
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setToDeleteAttribute(attribute);
                            deleteAttributeModal.open();
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>,
                ];

                if (isExpanded) {
                  rows.push(
                    <TableRow key={`${attribute.id}-values`}>
                      <TableCell colSpan={6} className="bg-slate-50">
                        <div className="space-y-2 px-2 py-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-700">
                              Değerler
                            </p>
                            {(attribute.type === 'SELECT' ||
                              attribute.type === 'COLOR') && (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => openCreateValue(attribute.id)}
                              >
                                <Plus className="h-3 w-3" />
                                Değer ekle
                              </Button>
                            )}
                          </div>
                          {attribute.type === 'SELECT' ||
                          attribute.type === 'COLOR' ? (
                            attribute.values.length === 0 ? (
                              <p className="text-sm text-slate-500">
                                Henüz değer yok.
                              </p>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {attribute.values.map((value) => (
                                  <div
                                    key={value.id}
                                    className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-sm"
                                  >
                                    {attribute.type === 'COLOR' &&
                                    value.colorHex ? (
                                      <span
                                        className="inline-block h-4 w-4 rounded-full border"
                                        style={{ backgroundColor: value.colorHex }}
                                      />
                                    ) : null}
                                    <span>{value.value}</span>
                                    <button
                                      type="button"
                                      className="text-slate-400 hover:text-slate-700"
                                      onClick={() =>
                                        openEditValue(attribute.id, value)
                                      }
                                    >
                                      <Pencil className="h-3 w-3" />
                                    </button>
                                    <button
                                      type="button"
                                      className="text-red-400 hover:text-red-600"
                                      onClick={() => {
                                        setToDeleteValue({
                                          attributeId: attribute.id,
                                          valueId: value.id,
                                          label: value.value,
                                        });
                                        deleteValueModal.open();
                                      }}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )
                          ) : (
                            <p className="text-sm text-slate-500">
                              Bu tür için önceden tanımlı değer gerekmez.
                            </p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>,
                  );
                }

                return rows;
              })}
            </TableQueryState>
          </TableBody>
        </Table>
      </ListPageShell>

      <Modal
        isOpen={valueModal.isOpen}
        onClose={valueModal.close}
        title={selectedValueId ? 'Değer düzenle' : 'Yeni değer'}
        size="sm"
      >
        <div className="space-y-3">
          <div>
            <Label>Değer</Label>
            <Input
              value={valueForm.value}
              onChange={(event) =>
                setValueForm((prev) => ({ ...prev, value: event.target.value }))
              }
            />
          </div>
          <div>
            <Label>Renk kodu (opsiyonel)</Label>
            <Input
              value={valueForm.colorHex}
              onChange={(event) =>
                setValueForm((prev) => ({
                  ...prev,
                  colorHex: event.target.value,
                }))
              }
              placeholder="#FF0000"
            />
          </div>
          <div>
            <Label>Sıra</Label>
            <Input
              type="number"
              value={valueForm.sortOrder}
              onChange={(event) =>
                setValueForm((prev) => ({
                  ...prev,
                  sortOrder: Number(event.target.value) || 0,
                }))
              }
            />
          </div>
        </div>
        {errorMessage ? (
          <p className="mt-3 text-sm text-red-600">{errorMessage}</p>
        ) : null}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={valueModal.close}>
            İptal
          </Button>
          <Button
            disabled={saveValueMutation.isPending}
            onClick={() => saveValueMutation.mutate()}
          >
            Kaydet
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteAttributeModal.isOpen}
        onClose={deleteAttributeModal.close}
        title="Özelliği sil"
        description={
          toDeleteAttribute
            ? `"${toDeleteAttribute.name}" kalıcı olarak silinecek. Devam edilsin mi?`
            : 'Bu özellik kalıcı olarak silinecek.'
        }
        confirmLabel="Sil"
        isLoading={deleteAttributeMutation.isPending}
        onConfirm={() => deleteAttributeMutation.mutate()}
      />

      <ConfirmDialog
        isOpen={deleteValueModal.isOpen}
        onClose={deleteValueModal.close}
        title="Değeri sil"
        description={
          toDeleteValue
            ? `"${toDeleteValue.label}" kalıcı olarak silinecek. Devam edilsin mi?`
            : 'Bu değer kalıcı olarak silinecek.'
        }
        confirmLabel="Sil"
        isLoading={deleteValueMutation.isPending}
        onConfirm={() => deleteValueMutation.mutate()}
      />
    </>
  );
}
