import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { FormDefinitionDto, FormFieldDefinitionDto } from '@/shared/types/api';
import { ApiError } from '@/shared/api/client';
import {
  createFormDefinition,
  deleteFormDefinition,
  FORM_FIELD_TYPE_LABELS,
  listFormDefinitions,
  updateFormDefinition,
} from '@/shared/api/contact.api';
import { ContactSubNav } from '@/admin/components/ContactSubNav';
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

function emptyField(): FormFieldDefinitionDto {
  return { name: 'field', label: 'Alan', type: 'text', required: false };
}

export function FormDefinitionsPage() {
  const queryClient = useQueryClient();
  const formModal = useDisclosure();
  const deleteModal = useDisclosure();

  const [selected, setSelected] = useState<FormDefinitionDto | null>(null);
  const [toDelete, setToDelete] = useState<FormDefinitionDto | null>(null);
  const [form, setForm] = useState({
    name: '',
    key: '',
    isActive: true,
    fields: [emptyField()] as FormFieldDefinitionDto[],
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formsQuery = useQuery({
    queryKey: ['admin', 'form-definitions'],
    queryFn: listFormDefinitions,
  });

  useEffect(() => {
    if (selected) {
      setForm({
        name: selected.name,
        key: selected.key,
        isActive: selected.isActive,
        fields: selected.fields.length ? selected.fields : [emptyField()],
      });
    }
  }, [selected]);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['admin', 'form-definitions'] });

  const openCreate = () => {
    setSelected(null);
    setForm({ name: '', key: '', isActive: true, fields: [emptyField()] });
    formModal.open();
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        name: form.name,
        key: form.key,
        isActive: form.isActive,
        fields: form.fields,
      };
      return selected
        ? updateFormDefinition(selected.id, payload)
        : createFormDefinition(payload);
    },
    onSuccess: () => {
      invalidate();
      formModal.close();
      setSelected(null);
      setErrorMessage(null);
    },
    onError: (error) => {
      setErrorMessage(
        error instanceof ApiError ? error.message : 'Kayıt başarısız',
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteFormDefinition(toDelete!.id),
    onSuccess: () => {
      invalidate();
      deleteModal.close();
      setToDelete(null);
    },
  });

  const updateField = (
    index: number,
    patch: Partial<FormFieldDefinitionDto>,
  ) => {
    setForm((prev) => ({
      ...prev,
      fields: prev.fields.map((field, i) =>
        i === index ? { ...field, ...patch } : field,
      ),
    }));
  };

  return (
    <>
      <ContactSubNav />
      <Card padding="sm">
        <CardHeader
          title="Form tanımları"
          description="Builder CONTACT_FORM bloğu ve özel formlar için"
          action={
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Yeni form
            </Button>
          }
        />

        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Ad</TableHeaderCell>
              <TableHeaderCell>Anahtar</TableHeaderCell>
              <TableHeaderCell>Alan</TableHeaderCell>
              <TableHeaderCell>Durum</TableHeaderCell>
              <TableHeaderCell className="text-right">İşlem</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {formsQuery.isLoading ? (
              <TableEmpty colSpan={5} message="Yükleniyor…" />
            ) : (formsQuery.data?.length ?? 0) === 0 ? (
              <TableEmpty colSpan={5} message="Henüz form tanımı yok." />
            ) : (
              formsQuery.data!.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="font-mono text-xs">{item.key}</TableCell>
                  <TableCell>{item.fields.length} alan</TableCell>
                  <TableCell>
                    <Badge variant={item.isActive ? 'success' : 'default'}>
                      {item.isActive ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelected(item);
                          formModal.open();
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setToDelete(item);
                          deleteModal.open();
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
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
        title={selected ? 'Form düzenle' : 'Yeni form'}
        size="lg"
      >
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label>Ad</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div>
            <Label>Anahtar (slug)</Label>
            <Input
              value={form.key}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  key: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                }))
              }
              placeholder="iletisim-formu"
            />
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <Label>Alanlar</Label>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() =>
                setForm((p) => ({ ...p, fields: [...p.fields, emptyField()] }))
              }
            >
              Alan ekle
            </Button>
          </div>
          <div className="space-y-3">
            {form.fields.map((field, index) => (
              <div
                key={index}
                className="grid gap-2 rounded-lg border border-slate-200 p-3 md:grid-cols-4"
              >
                <Input
                  placeholder="name"
                  value={field.name}
                  onChange={(e) => updateField(index, { name: e.target.value })}
                />
                <Input
                  placeholder="Etiket"
                  value={field.label}
                  onChange={(e) => updateField(index, { label: e.target.value })}
                />
                <Select
                  value={field.type}
                  onChange={(e) =>
                    updateField(index, {
                      type: e.target.value as FormFieldDefinitionDto['type'],
                    })
                  }
                >
                  {Object.entries(FORM_FIELD_TYPE_LABELS).map(
                    ([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ),
                  )}
                </Select>
                <div className="flex items-center justify-between gap-2">
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={field.required ?? false}
                      onChange={(e) =>
                        updateField(index, { required: e.target.checked })
                      }
                    />
                    Zorunlu
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        fields: p.fields.filter((_, i) => i !== index),
                      }))
                    }
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) =>
              setForm((p) => ({ ...p, isActive: e.target.checked }))
            }
          />
          Aktif
        </label>

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

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Formu sil"
        size="sm"
      >
        <p className="text-sm text-slate-600">
          &quot;{toDelete?.name}&quot; silinecek. Devam edilsin mi?
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={deleteModal.close}>
            İptal
          </Button>
          <Button
            variant="danger"
            disabled={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate()}
          >
            Sil
          </Button>
        </div>
      </Modal>
    </>
  );
}
