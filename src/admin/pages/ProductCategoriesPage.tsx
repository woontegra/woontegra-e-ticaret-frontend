import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { ProductCategoryDto } from '@/shared/types/api';
import {
  deleteProductCategory,
  listProductCategories,
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
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/shared/ui';

const PAGE_SIZE = 20;

export function ProductCategoriesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const deleteModal = useDisclosure();
  const { onSuccess, onError } = useAdminMutationFeedback();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<ProductCategoryDto | null>(null);

  const queryParams = useMemo(
    () => ({
      search: search || undefined,
      page,
      limit: PAGE_SIZE,
    }),
    [search, page],
  );

  const categoriesQuery = useQuery({
    queryKey: ['admin', 'product-categories', queryParams],
    queryFn: () => listProductCategories(queryParams),
  });

  const items = categoriesQuery.data?.items ?? [];
  const total = categoriesQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [search]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'product-categories'] });
    queryClient.invalidateQueries({ queryKey: ['public', 'categories'] });
  };

  const deleteMutation = useMutation({
    mutationFn: () => deleteProductCategory(toDelete!.id),
    onSuccess: () => {
      invalidate();
      deleteModal.close();
      setToDelete(null);
      onSuccess('Kategori silindi.');
    },
    onError: (error) => onError(error, 'Kategori silinemedi.'),
  });

  return (
    <>
      <ListPageShell
        title="Kategoriler"
        description="Ürün kategorilerini ve hiyerarşisini yönetin"
        actions={
          <Button
            size="sm"
            onClick={() => navigate('/admin/products/categories/new')}
          >
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
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        }
      >
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
            <TableQueryState
              colSpan={4}
              isLoading={categoriesQuery.isLoading}
              isError={categoriesQuery.isError}
              isEmpty={items.length === 0}
              emptyMessage="Henüz kategori yok."
            >
              {items.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-[rgb(var(--admin-text-muted))]">
                    {category.slug}
                  </TableCell>
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
                        onClick={() =>
                          navigate(`/admin/products/categories/${category.id}`)
                        }
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
              ))}
            </TableQueryState>
          </TableBody>
        </Table>
      </ListPageShell>

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Kategoriyi sil"
        description={
          toDelete
            ? `"${toDelete.name}" kalıcı olarak silinecek. Devam edilsin mi?`
            : 'Bu kategori kalıcı olarak silinecek.'
        }
        confirmLabel="Sil"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />
    </>
  );
}
