import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { ShippingMethodDto, ShippingMethodType } from '@/shared/types/api';
import { ApiError } from '@/shared/api/client';
import {
  createShippingMethod,
  deleteShippingMethod,
  formatMoney,
  listShippingMethods,
  SHIPPING_METHOD_TYPE_LABELS,
  updateShippingMethod,
} from '@/shared/api/shipping.api';
import { ShippingSubNav } from '@/admin/components/ShippingSubNav';
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

export function ShippingMethodsPage() {
  const queryClient = useQueryClient();
  const formModal = useDisclosure();
  const deleteModal = useDisclosure();

  const [selected, setSelected] = useState<ShippingMethodDto | null>(null);
  const [toDelete, setToDelete] = useState<ShippingMethodDto | null>(null);
  const [form, setForm] = useState({
    name: '',
    type: 'FIXED' as ShippingMethodType,
    price: '0',
    freeShippingThreshold: '',
    isActive: true,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const methodsQuery = useQuery({
    queryKey: ['admin', 'shipping-methods'],
    queryFn: listShippingMethods,
  });

  useEffect(() => {
    if (selected) {
      setForm({
        name: selected.name,
        type: selected.type,
        price: String(selected.price),
        freeShippingThreshold:
          selected.freeShippingThreshold !== null
            ? String(selected.freeShippingThreshold)
            : '',
        isActive: selected.isActive,
      });
    }
  }, [selected]);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['admin', 'shipping-methods'] });

  const openCreate = () => {
    setSelected(null);
    setForm({
      name: '',
      type: 'FIXED',
      price: '0',
      freeShippingThreshold: '',
      isActive: true,
    });
    formModal.open();
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        name: form.name,
        type: form.type,
        price: Number(form.price),
        freeShippingThreshold:
          form.type === 'FREE_OVER_AMOUNT' && form.freeShippingThreshold
            ? Number(form.freeShippingThreshold)
            : null,
        isActive: form.isActive,
      };
      return selected
        ? updateShippingMethod(selected.id, payload)
        : createShippingMethod(payload);
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
    mutationFn: () => deleteShippingMethod(toDelete!.id),
    onSuccess: () => {
      invalidate();
      deleteModal.close();
      setToDelete(null);
    },
  });

  return (
    <>
      <ShippingSubNav />
      <Card padding="sm">
        <CardHeader
          title="Kargo yöntemleri"
          description="Checkout için kargo ücreti seçenekleri"
          action={
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Yeni yöntem
            </Button>
          }
        />

        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Ad</TableHeaderCell>
              <TableHeaderCell>Tip</TableHeaderCell>
              <TableHeaderCell>Ücret</TableHeaderCell>
              <TableHeaderCell>Durum</TableHeaderCell>
              <TableHeaderCell className="text-right">İşlem</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {methodsQuery.isLoading ? (
              <TableEmpty colSpan={5} message="Yükleniyor…" />
            ) : (methodsQuery.data?.length ?? 0) === 0 ? (
              <TableEmpty colSpan={5} message="Henüz kargo yöntemi yok." />
            ) : (
              methodsQuery.data!.map((method) => (
                <TableRow key={method.id}>
                  <TableCell>{method.name}</TableCell>
                  <TableCell className="text-slate-500">
                    {SHIPPING_METHOD_TYPE_LABELS[method.type]}
                  </TableCell>
                  <TableCell>
                    {method.type === 'FREE_OVER_AMOUNT' &&
                    method.freeShippingThreshold !== null ? (
                      <span>
                        {formatMoney(method.price)} · ücretsiz eşik:{' '}
                        {formatMoney(method.freeShippingThreshold)}
                      </span>
                    ) : (
                      formatMoney(method.price)
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={method.isActive ? 'success' : 'default'}>
                      {method.isActive ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelected(method);
                          formModal.open();
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setToDelete(method);
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
        title={selected ? 'Kargo yöntemi düzenle' : 'Yeni kargo yöntemi'}
        size="lg"
      >
        <div className="grid gap-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label>Ad</Label>
            <Input
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
            />
          </div>
          <div>
            <Label>Tip</Label>
            <Select
              value={form.type}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  type: event.target.value as ShippingMethodType,
                }))
              }
            >
              {Object.entries(SHIPPING_METHOD_TYPE_LABELS).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ),
              )}
            </Select>
          </div>
          <div>
            <Label>Ücret (₺)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, price: event.target.value }))
              }
            />
          </div>
          {form.type === 'FREE_OVER_AMOUNT' ? (
            <div className="md:col-span-2">
              <Label>Ücretsiz kargo eşiği (₺)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.freeShippingThreshold}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    freeShippingThreshold: event.target.value,
                  }))
                }
              />
            </div>
          ) : null}
          <div className="md:col-span-2 flex items-center gap-2">
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

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Kargo yöntemini sil"
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
