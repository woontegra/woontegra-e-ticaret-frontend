import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { BrandDto } from '@/shared/types/api';
import { ApiError } from '@/shared/api/client';
import {
  createBrand,
  deleteBrand,
  listBrands,
  slugifyClient,
  updateBrand,
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
  MediaField,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeaderCell,
  TableRow,
  Textarea,
} from '@/shared/ui';

export function BrandsPage() {
  const queryClient = useQueryClient();
  const formModal = useDisclosure();
  const deleteModal = useDisclosure();

  const [selected, setSelected] = useState<BrandDto | null>(null);
  const [toDelete, setToDelete] = useState<BrandDto | null>(null);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    logoId: null as string | null,
    description: '',
    seoTitle: '',
    seoDescription: '',
    isActive: true,
  });
  const [slugTouched, setSlugTouched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const brandsQuery = useQuery({
    queryKey: ['admin', 'brands'],
    queryFn: listBrands,
  });

  useEffect(() => {
    if (selected) {
      setForm({
        name: selected.name,
        slug: selected.slug,
        logoId: selected.logoId,
        description: selected.description ?? '',
        seoTitle: selected.seoTitle ?? '',
        seoDescription: selected.seoDescription ?? '',
        isActive: selected.isActive,
      });
      setSlugTouched(true);
    }
  }, [selected]);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['admin', 'brands'] });

  const openCreate = () => {
    setSelected(null);
    setForm({
      name: '',
      slug: '',
      logoId: null,
      description: '',
      seoTitle: '',
      seoDescription: '',
      isActive: true,
    });
    setSlugTouched(false);
    formModal.open();
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        name: form.name,
        slug: form.slug,
        logoId: form.logoId,
        description: form.description || null,
        seoTitle: form.seoTitle || null,
        seoDescription: form.seoDescription || null,
        isActive: form.isActive,
      };

      return selected
        ? updateBrand(selected.id, payload)
        : createBrand(payload);
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
    mutationFn: () => deleteBrand(toDelete!.id),
    onSuccess: () => {
      invalidate();
      deleteModal.close();
      setToDelete(null);
    },
  });

  return (
    <>
      <ProductsSubNav />
      <Card padding="sm">
        <CardHeader
          title="Markalar"
          description="Ürün markalarını yönetin"
          action={
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Yeni marka
            </Button>
          }
        />

        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Ad</TableHeaderCell>
              <TableHeaderCell>Slug</TableHeaderCell>
              <TableHeaderCell>Durum</TableHeaderCell>
              <TableHeaderCell className="text-right">İşlem</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {brandsQuery.isLoading ? (
              <TableEmpty colSpan={4} message="Yükleniyor…" />
            ) : (brandsQuery.data?.length ?? 0) === 0 ? (
              <TableEmpty colSpan={4} message="Henüz marka yok." />
            ) : (
              brandsQuery.data!.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell>{brand.name}</TableCell>
                  <TableCell className="text-slate-500">{brand.slug}</TableCell>
                  <TableCell>
                    <Badge variant={brand.isActive ? 'success' : 'default'}>
                      {brand.isActive ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelected(brand);
                          formModal.open();
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setToDelete(brand);
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
        title={selected ? 'Marka düzenle' : 'Yeni marka'}
        size="lg"
      >
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label>Ad</Label>
            <Input
              value={form.name}
              onChange={(event) => {
                const name = event.target.value;
                setForm((prev) => ({
                  ...prev,
                  name,
                  slug: slugTouched ? prev.slug : slugifyClient(name),
                }));
              }}
            />
          </div>
          <div>
            <Label>Slug</Label>
            <Input
              value={form.slug}
              onChange={(event) => {
                setSlugTouched(true);
                setForm((prev) => ({
                  ...prev,
                  slug: slugifyClient(event.target.value),
                }));
              }}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Açıklama</Label>
            <Textarea
              rows={3}
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, description: event.target.value }))
              }
            />
          </div>
          <div className="md:col-span-2">
            <MediaField
              label="Logo"
              value={form.logoId}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, logoId: value }))
              }
              folder="products"
            />
          </div>
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
        title="Markayı sil"
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
