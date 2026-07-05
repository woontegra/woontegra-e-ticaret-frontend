import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react';
import type { ProductAttributeDto, ProductAttributeType } from '@/shared/types/api';
import { ApiError } from '@/shared/api/client';
import {
  createProductAttribute,
  createProductAttributeValue,
  deleteProductAttribute,
  deleteProductAttributeValue,
  listProductAttributes,
  PRODUCT_ATTRIBUTE_TYPE_LABELS,
  updateProductAttribute,
  updateProductAttributeValue,
} from '@/shared/api/products.api';
import { ProductsSubNav } from '@/admin/components/ProductsSubNav';
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
} from '@/shared/ui';

function emptyAttributeForm() {
  return {
    name: '',
    code: '',
    type: 'TEXT' as ProductAttributeType,
    isFilterable: false,
    isVariantOption: false,
    sortOrder: 0,
  };
}

function emptyValueForm() {
  return {
    value: '',
    colorHex: '',
    sortOrder: 0,
  };
}

export function ProductAttributesPage() {
  const queryClient = useQueryClient();
  const attributeModal = useDisclosure();
  const valueModal = useDisclosure();
  const deleteAttributeModal = useDisclosure();
  const deleteValueModal = useDisclosure();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedAttribute, setSelectedAttribute] =
    useState<ProductAttributeDto | null>(null);
  const [attributeForm, setAttributeForm] = useState(emptyAttributeForm());
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

  useEffect(() => {
    if (selectedAttribute) {
      setAttributeForm({
        name: selectedAttribute.name,
        code: selectedAttribute.code,
        type: selectedAttribute.type,
        isFilterable: selectedAttribute.isFilterable,
        isVariantOption: selectedAttribute.isVariantOption,
        sortOrder: selectedAttribute.sortOrder,
      });
    }
  }, [selectedAttribute]);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['admin', 'product-attributes'] });

  const openCreateAttribute = () => {
    setSelectedAttribute(null);
    setAttributeForm(emptyAttributeForm());
    setErrorMessage(null);
    attributeModal.open();
  };

  const openEditAttribute = (attribute: ProductAttributeDto) => {
    setSelectedAttribute(attribute);
    setErrorMessage(null);
    attributeModal.open();
  };

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

  const saveAttributeMutation = useMutation({
    mutationFn: () => {
      const payload = {
        name: attributeForm.name,
        ...(attributeForm.code ? { code: attributeForm.code } : {}),
        type: attributeForm.type,
        isFilterable: attributeForm.isFilterable,
        isVariantOption: attributeForm.isVariantOption,
        sortOrder: attributeForm.sortOrder,
      };

      return selectedAttribute
        ? updateProductAttribute(selectedAttribute.id, payload)
        : createProductAttribute(payload);
    },
    onSuccess: () => {
      invalidate();
      attributeModal.close();
      setSelectedAttribute(null);
      setErrorMessage(null);
    },
    onError: (error) => {
      setErrorMessage(
        error instanceof ApiError ? error.message : 'Kayıt başarısız',
      );
    },
  });

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
    },
  });

  const deleteValueMutation = useMutation({
    mutationFn: () =>
      deleteProductAttributeValue(toDeleteValue!.attributeId, toDeleteValue!.valueId),
    onSuccess: () => {
      invalidate();
      deleteValueModal.close();
      setToDeleteValue(null);
    },
  });

  const attributes = attributesQuery.data ?? [];

  return (
    <>
      <ProductsSubNav />
      <Card padding="sm">
        <CardHeader
          title="Özellikler"
          description="Ürün özellikleri ve varyant seçeneklerini yönetin"
          action={
            <Button size="sm" onClick={openCreateAttribute}>
              <Plus className="h-4 w-4" />
              Yeni özellik
            </Button>
          }
        />

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
            {attributesQuery.isLoading ? (
              <TableEmpty colSpan={6} message="Yükleniyor…" />
            ) : attributes.length === 0 ? (
              <TableEmpty colSpan={6} message="Henüz özellik tanımlanmadı." />
            ) : (
              attributes.flatMap((attribute) => {
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
                          onClick={() => openEditAttribute(attribute)}
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
              })
            )}
          </TableBody>
        </Table>
      </Card>

      <Modal
        isOpen={attributeModal.isOpen}
        onClose={attributeModal.close}
        title={selectedAttribute ? 'Özellik düzenle' : 'Yeni özellik'}
        size="lg"
      >
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label>Ad</Label>
            <Input
              value={attributeForm.name}
              onChange={(event) =>
                setAttributeForm((prev) => ({
                  ...prev,
                  name: event.target.value,
                }))
              }
            />
          </div>
          <div>
            <Label>Kod</Label>
            <Input
              value={attributeForm.code}
              onChange={(event) =>
                setAttributeForm((prev) => ({
                  ...prev,
                  code: event.target.value,
                }))
              }
              placeholder="Otomatik üretilir"
            />
          </div>
          <div>
            <Label>Tür</Label>
            <Select
              value={attributeForm.type}
              onChange={(event) =>
                setAttributeForm((prev) => ({
                  ...prev,
                  type: event.target.value as ProductAttributeType,
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
              value={attributeForm.sortOrder}
              onChange={(event) =>
                setAttributeForm((prev) => ({
                  ...prev,
                  sortOrder: Number(event.target.value) || 0,
                }))
              }
            />
          </div>
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input
              type="checkbox"
              checked={attributeForm.isFilterable}
              onChange={(event) =>
                setAttributeForm((prev) => ({
                  ...prev,
                  isFilterable: event.target.checked,
                }))
              }
            />
            Filtrelenebilir
          </label>
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input
              type="checkbox"
              checked={attributeForm.isVariantOption}
              onChange={(event) =>
                setAttributeForm((prev) => ({
                  ...prev,
                  isVariantOption: event.target.checked,
                }))
              }
            />
            Varyant seçeneği (renk, beden vb.)
          </label>
        </div>
        {errorMessage ? (
          <p className="mt-3 text-sm text-red-600">{errorMessage}</p>
        ) : null}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={attributeModal.close}>
            İptal
          </Button>
          <Button
            disabled={saveAttributeMutation.isPending}
            onClick={() => saveAttributeMutation.mutate()}
          >
            Kaydet
          </Button>
        </div>
      </Modal>

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

      <Modal
        isOpen={deleteAttributeModal.isOpen}
        onClose={deleteAttributeModal.close}
        title="Özelliği sil"
        size="sm"
      >
        <p className="text-sm text-slate-600">
          &quot;{toDeleteAttribute?.name}&quot; silinecek. Devam edilsin mi?
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={deleteAttributeModal.close}>
            İptal
          </Button>
          <Button
            variant="danger"
            disabled={deleteAttributeMutation.isPending}
            onClick={() => deleteAttributeMutation.mutate()}
          >
            Sil
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={deleteValueModal.isOpen}
        onClose={deleteValueModal.close}
        title="Değeri sil"
        size="sm"
      >
        <p className="text-sm text-slate-600">
          &quot;{toDeleteValue?.label}&quot; silinecek. Devam edilsin mi?
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={deleteValueModal.close}>
            İptal
          </Button>
          <Button
            variant="danger"
            disabled={deleteValueMutation.isPending}
            onClick={() => deleteValueMutation.mutate()}
          >
            Sil
          </Button>
        </div>
      </Modal>
    </>
  );
}
