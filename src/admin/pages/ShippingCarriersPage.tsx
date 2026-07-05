import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { ShippingCarrierDto } from '@/shared/types/api';
import { ApiError } from '@/shared/api/client';
import {
  createShippingCarrier,
  deleteShippingCarrier,
  listShippingCarriers,
  updateShippingCarrier,
} from '@/shared/api/shipping.api';
import { AdminPanel } from '@/admin/components/AdminPanel';
import { ShippingSubNav } from '@/admin/components/ShippingSubNav';
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
  MediaField,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/shared/ui';

export function ShippingCarriersPage() {
  const queryClient = useQueryClient();
  const formModal = useDisclosure();
  const deleteModal = useDisclosure();
  const { onSuccess, onError } = useAdminMutationFeedback();

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ShippingCarrierDto | null>(null);
  const [toDelete, setToDelete] = useState<ShippingCarrierDto | null>(null);
  const [form, setForm] = useState({
    name: '',
    trackingUrlTemplate: '',
    logoId: null as string | null,
    isActive: true,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const carriersQuery = useQuery({
    queryKey: ['admin', 'shipping-carriers'],
    queryFn: listShippingCarriers,
  });

  const filteredCarriers = useMemo(() => {
    const items = carriersQuery.data ?? [];
    if (!search.trim()) return items;
    const q = search.trim().toLowerCase();
    return items.filter((carrier) =>
      carrier.name.toLowerCase().includes(q),
    );
  }, [carriersQuery.data, search]);

  useEffect(() => {
    if (selected) {
      setForm({
        name: selected.name,
        trackingUrlTemplate: selected.trackingUrlTemplate,
        logoId: selected.logoId,
        isActive: selected.isActive,
      });
    }
  }, [selected]);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['admin', 'shipping-carriers'] });

  const openCreate = () => {
    setSelected(null);
    setForm({
      name: '',
      trackingUrlTemplate: 'https://kargo.com/takip/{trackingNumber}',
      logoId: null,
      isActive: true,
    });
    formModal.open();
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        name: form.name,
        trackingUrlTemplate: form.trackingUrlTemplate,
        logoId: form.logoId,
        isActive: form.isActive,
      };
      return selected
        ? updateShippingCarrier(selected.id, payload)
        : createShippingCarrier(payload);
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
    mutationFn: () => deleteShippingCarrier(toDelete!.id),
    onSuccess: () => {
      invalidate();
      deleteModal.close();
      setToDelete(null);
      onSuccess('Kargo firması silindi.');
    },
    onError: (error) => onError(error, 'Firma silinemedi.'),
  });

  return (
    <>
      <ShippingSubNav />
      <AdminPanel
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Yeni firma
          </Button>
        }
        filters={
          <FilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Firma adı ara…"
          />
        }
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Firma</TableHeaderCell>
              <TableHeaderCell>Takip şablonu</TableHeaderCell>
              <TableHeaderCell>Durum</TableHeaderCell>
              <TableHeaderCell className="text-right">İşlem</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableQueryState
              colSpan={4}
              isLoading={carriersQuery.isLoading}
              isError={carriersQuery.isError}
              isEmpty={filteredCarriers.length === 0}
              emptyMessage="Henüz kargo firması yok."
            >
              {filteredCarriers.map((carrier) => (
                <TableRow key={carrier.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {carrier.logoUrl ? (
                        <img
                          src={carrier.logoUrl}
                          alt=""
                          className="h-6 w-6 rounded object-contain"
                        />
                      ) : null}
                      {carrier.name}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-slate-500">
                    {carrier.trackingUrlTemplate}
                  </TableCell>
                  <TableCell>
                    <Badge variant={carrier.isActive ? 'success' : 'default'}>
                      {carrier.isActive ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelected(carrier);
                          formModal.open();
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setToDelete(carrier);
                          deleteModal.open();
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableQueryState>
          </TableBody>
        </Table>
      </AdminPanel>

      <Modal
        isOpen={formModal.isOpen}
        onClose={formModal.close}
        title={selected ? 'Kargo firması düzenle' : 'Yeni kargo firması'}
        size="lg"
      >
        <div className="grid gap-3">
          <div>
            <Label>Firma adı</Label>
            <Input
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
            />
          </div>
          <div>
            <Label>Takip URL şablonu</Label>
            <Input
              value={form.trackingUrlTemplate}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  trackingUrlTemplate: event.target.value,
                }))
              }
              placeholder="https://kargo.com/takip/{trackingNumber}"
            />
            <p className="mt-1 text-xs text-slate-500">
              Takip numarası için {'{trackingNumber}'} yer tutucusunu kullanın.
            </p>
          </div>
          <div>
            <MediaField
              label="Logo"
              value={form.logoId}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, logoId: value }))
              }
              folder="shipping"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, isActive: event.target.checked }))
              }
            />
            <Label>Aktif</Label>
          </div>
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

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Kargo firmasını sil"
        description={
          toDelete
            ? `"${toDelete.name}" kalıcı olarak silinecek. Devam edilsin mi?`
            : 'Bu kargo firması kalıcı olarak silinecek.'
        }
        confirmLabel="Sil"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />
    </>
  );
}
