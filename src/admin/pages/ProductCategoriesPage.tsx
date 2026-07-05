import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { ProductCategoryDto } from '@/shared/types/api';
import { ApiError } from '@/shared/api/client';
import {
  createProductCategory,
  deleteProductCategory,
  listProductCategories,
  slugifyClient,
  updateProductCategory,
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

export function ProductCategoriesPage() {
  const queryClient = useQueryClient();
  const formModal = useDisclosure();
  const deleteModal = useDisclosure();

  const [selected, setSelected] = useState<ProductCategoryDto | null>(null);
  const [toDelete, setToDelete] = useState<ProductCategoryDto | null>(null);
  const [form, setForm] = useState({
    parentId: '',
    name: '',
    slug: '',
    description: '',
    imageId: null as string | null,
    bannerImageId: null as string | null,
    seoTitle: '',
    seoDescription: '',
    sortOrder: 0,
    isActive: true,
  });
  const [slugTouched, setSlugTouched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ['admin', 'product-categories'],
    queryFn: listProductCategories,
  });

  useEffect(() => {
    if (selected) {
      setForm({
        parentId: selected.parentId ?? '',
        name: selected.name,
        slug: selected.slug,
        description: selected.description ?? '',
        imageId: selected.imageId,
        bannerImageId: selected.bannerImageId,
        seoTitle: selected.seoTitle ?? '',
        seoDescription: selected.seoDescription ?? '',
        sortOrder: selected.sortOrder,
        isActive: selected.isActive,
      });
      setSlugTouched(true);
    }
  }, [selected]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'product-categories'] });
    queryClient.invalidateQueries({ queryKey: ['public', 'categories'] });
  };

  const openCreate = () => {
    setSelected(null);
    setForm({
      parentId: '',
      name: '',
      slug: '',
      description: '',
      imageId: null,
      bannerImageId: null,
      seoTitle: '',
      seoDescription: '',
      sortOrder: 0,
      isActive: true,
    });
    setSlugTouched(false);
    formModal.open();
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        parentId: form.parentId || null,
        name: form.name,
        slug: form.slug,
        description: form.description || null,
        imageId: form.imageId,
        bannerImageId: form.bannerImageId,
        seoTitle: form.seoTitle || null,
        seoDescription: form.seoDescription || null,
        sortOrder: form.sortOrder,
        isActive: form.isActive,
      };

      return selected
        ? updateProductCategory(selected.id, payload)
        : createProductCategory(payload);
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
    mutationFn: () => deleteProductCategory(toDelete!.id),
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
          title="Ürün kategorileri"
          description="Ürün ve yazılım kategorilerini yönetin"
          action={
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Yeni kategori
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
            {categoriesQuery.isLoading ? (
              <TableEmpty colSpan={4} message="Yükleniyor…" />
            ) : (categoriesQuery.data?.length ?? 0) === 0 ? (
              <TableEmpty colSpan={4} message="Henüz kategori yok." />
            ) : (
              categoriesQuery.data!.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell className="text-slate-500">{category.slug}</TableCell>
                  <TableCell>
                    <Badge variant={category.isActive ? 'success' : 'default'}>
                      {category.isActive ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelected(category);
                          formModal.open();
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setToDelete(category);
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
        title={selected ? 'Kategori düzenle' : 'Yeni kategori'}
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
          <div>
            <Label>Üst kategori</Label>
            <Select
              value={form.parentId}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, parentId: event.target.value }))
              }
            >
              <option value="">Yok</option>
              {categoriesQuery.data
                ?.filter((category) => category.id !== selected?.id)
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </Select>
          </div>
          <div>
            <Label>Sıra</Label>
            <Input
              type="number"
              value={form.sortOrder}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  sortOrder: Number(event.target.value),
                }))
              }
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
          <MediaField
            label="Görsel"
            value={form.imageId}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, imageId: value }))
            }
            folder="products"
          />
          <MediaField
            label="Banner görseli"
            value={form.bannerImageId}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, bannerImageId: value }))
            }
            folder="products"
          />
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
        title="Kategoriyi sil"
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
