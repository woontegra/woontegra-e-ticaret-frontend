import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { BlogCategoryDto } from '@/shared/types/api';
import { ApiError } from '@/shared/api/client';
import {
  createBlogCategory,
  deleteBlogCategory,
  listBlogCategories,
  slugifyClient,
  updateBlogCategory,
} from '@/shared/api/blog.api';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Input,
  Label,
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

export function BlogCategoriesPage() {
  const queryClient = useQueryClient();
  const formModal = useDisclosure();
  const deleteModal = useDisclosure();

  const [selected, setSelected] = useState<BlogCategoryDto | null>(null);
  const [toDelete, setToDelete] = useState<BlogCategoryDto | null>(null);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    seoTitle: '',
    seoDescription: '',
    isActive: true,
  });
  const [slugTouched, setSlugTouched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ['admin', 'blog', 'categories'],
    queryFn: listBlogCategories,
  });

  useEffect(() => {
    if (selected) {
      setForm({
        name: selected.name,
        slug: selected.slug,
        description: selected.description ?? '',
        seoTitle: selected.seoTitle ?? '',
        seoDescription: selected.seoDescription ?? '',
        isActive: selected.isActive,
      });
      setSlugTouched(true);
    }
  }, [selected]);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['admin', 'blog', 'categories'] });

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description || null,
        seoTitle: form.seoTitle || null,
        seoDescription: form.seoDescription || null,
        isActive: form.isActive,
      };

      return selected
        ? updateBlogCategory(selected.id, payload)
        : createBlogCategory(payload);
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
    mutationFn: () => deleteBlogCategory(toDelete!.id),
    onSuccess: () => {
      invalidate();
      deleteModal.close();
      setToDelete(null);
    },
  });

  const openCreate = () => {
    setSelected(null);
    setForm({
      name: '',
      slug: '',
      description: '',
      seoTitle: '',
      seoDescription: '',
      isActive: true,
    });
    setSlugTouched(false);
    setErrorMessage(null);
    formModal.open();
  };

  const openEdit = (category: BlogCategoryDto) => {
    setSelected(category);
    setErrorMessage(null);
    formModal.open();
  };

  return (
    <>
      <Card padding="sm">
        <CardHeader
          title="Blog Kategorileri"
          description="Blog kategorilerini yönetin"
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
              <TableHeaderCell className="text-right">İşlemler</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categoriesQuery.isLoading ? (
              <TableEmpty colSpan={4} message="Yükleniyor…" />
            ) : (categoriesQuery.data?.length ?? 0) === 0 ? (
              <TableEmpty colSpan={4} message="Kategori bulunamadı" />
            ) : (
              categoriesQuery.data!.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="font-mono text-xs text-slate-600">
                    {category.slug}
                  </TableCell>
                  <TableCell>
                    <Badge variant={category.isActive ? 'success' : 'default'}>
                      {category.isActive ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(category)}
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
                        <Trash2 className="h-4 w-4 text-red-500" />
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
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={formModal.close}>
              İptal
            </Button>
            <Button
              isLoading={saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
            >
              Kaydet
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {errorMessage ? (
            <p className="text-sm text-red-600">{errorMessage}</p>
          ) : null}
          <div>
            <Label htmlFor="cat-name" required>
              Ad
            </Label>
            <Input
              id="cat-name"
              value={form.name}
              onChange={(event) => {
                const name = event.target.value;
                setForm((prev) => ({
                  ...prev,
                  name,
                  ...(!slugTouched ? { slug: slugifyClient(name) } : {}),
                }));
              }}
            />
          </div>
          <div>
            <Label htmlFor="cat-slug" required>
              Slug
            </Label>
            <Input
              id="cat-slug"
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
            <Label htmlFor="cat-desc">Açıklama</Label>
            <Textarea
              id="cat-desc"
              rows={2}
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, description: event.target.value }))
              }
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, isActive: event.target.checked }))
              }
              className="rounded border-slate-300"
            />
            Aktif
          </label>
        </div>
      </Modal>

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Kategoriyi sil"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={deleteModal.close}>
              İptal
            </Button>
            <Button
              variant="danger"
              isLoading={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
            >
              Sil
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          <strong>{toDelete?.name}</strong> silinecek. Yazılardaki kategori
          bağlantısı kaldırılır.
        </p>
      </Modal>
    </>
  );
}
