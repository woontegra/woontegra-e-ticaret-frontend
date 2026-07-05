import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { BrandDto } from '@/shared/types/api';
import {
  deleteBrand,
  listBrands,
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

export function BrandsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const deleteModal = useDisclosure();
  const { onSuccess, onError } = useAdminMutationFeedback();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<BrandDto | null>(null);

  const queryParams = useMemo(
    () => ({
      search: search || undefined,
      page,
      limit: PAGE_SIZE,
    }),
    [search, page],
  );

  const brandsQuery = useQuery({
    queryKey: ['admin', 'brands', queryParams],
    queryFn: () => listBrands(queryParams),
  });

  const items = brandsQuery.data?.items ?? [];
  const total = brandsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [search]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'brands'] });
    queryClient.invalidateQueries({ queryKey: ['public', 'brands'] });
  };

  const deleteMutation = useMutation({
    mutationFn: () => deleteBrand(toDelete!.id),
    onSuccess: () => {
      invalidate();
      deleteModal.close();
      setToDelete(null);
      onSuccess('Marka silindi.');
    },
    onError: (error) => onError(error, 'Marka silinemedi.'),
  });

  return (
    <>
      <ListPageShell
        title="Markalar"
        description="Ürün markalarını ve logo bilgilerini yönetin"
        actions={
          <Button size="sm" onClick={() => navigate('/admin/products/brands/new')}>
            <Plus className="h-4 w-4" />
            Yeni marka
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
              isLoading={brandsQuery.isLoading}
              isError={brandsQuery.isError}
              isEmpty={items.length === 0}
              emptyMessage="Henüz marka yok."
            >
              {items.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell className="text-[rgb(var(--admin-text-muted))]">
                    {brand.slug}
                  </TableCell>
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
                        onClick={() =>
                          navigate(`/admin/products/brands/${brand.id}`)
                        }
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
              ))}
            </TableQueryState>
          </TableBody>
        </Table>
      </ListPageShell>

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Markayı sil"
        description={
          toDelete
            ? `"${toDelete.name}" kalıcı olarak silinecek. Devam edilsin mi?`
            : 'Bu marka kalıcı olarak silinecek.'
        }
        confirmLabel="Sil"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />
    </>
  );
}
