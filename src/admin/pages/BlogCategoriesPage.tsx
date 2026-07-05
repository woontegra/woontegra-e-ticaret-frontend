import { useEffect, useMemo, useState } from 'react';
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
import { AdminPanel } from '@/admin/components/AdminPanel';
import { BlogSubNav } from '@/admin/components/BlogSubNav';
import { TableQueryState } from '@/admin/components/TableQueryState';
import { useAdminMutationFeedback } from '@/admin/hooks/useAdminMutationFeedback';
import { useClientPagination } from '@/admin/hooks/useClientPagination';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import {
  Badge,
  Button,
  ConfirmDialog,
  FilterBar,
  Input,
  Label,
  Modal,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Textarea,
} from '@/shared/ui';

const PAGE_SIZE = 20;

export function BlogCategoriesPage() {
  const queryClient = useQueryClient();
  const formModal = useDisclosure();
  const deleteModal = useDisclosure();
  const { onSuccess, onError } = useAdminMutationFeedback();

  const [search, setSearch] = useState('');
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

  const filteredCategories = useMemo(() => {
    const items = categoriesQuery.data ?? [];
    if (!search.trim()) return items;
    const q = search.trim().toLowerCase();
    return items.filter(
      (category) =>
        category.name.toLowerCase().includes(q) ||
        category.slug.toLowerCase().includes(q),
    );
  }, [categoriesQuery.data, search]);

  const pagination = useClientPagination(filteredCategories, PAGE_SIZE);

  useEffect(() => {
    pagination.resetPage();
  }, [search]);

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
      onSuccess('Kategori silindi.');
    },
    onError: (error) => onError(error, 'Kategori silinemedi.'),
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
      <BlogSubNav />
      <AdminPanel
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Yeni kategori
          </Button>
        }
        filters={
          <FilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Ad veya slug ara…"
          />
        }
        footer={
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            pageSize={PAGE_SIZE}
            onPageChange={pagination.setPage}
          />
        }
      >
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
            <TableQueryState
              colSpan={4}
              isLoading={categoriesQuery.isLoading}
              isError={categoriesQuery.isError}
              isEmpty={pagination.items.length === 0}
              emptyMessage="Kategori bulunamadı"
            >
              {pagination.items.map((category) => (
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
              ))}
            </TableQueryState>
          </TableBody>
        </Table>
      </AdminPanel>

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

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Kategoriyi sil"
        description={
          toDelete
            ? `"${toDelete.name}" silinecek. Yazılardaki kategori bağlantısı kaldırılır.`
            : 'Bu kategori silinecek.'
        }
        confirmLabel="Sil"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />
    </>
  );
}
