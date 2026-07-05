import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { CouponDto } from '@/shared/types/api';
import {
  COUPON_TYPE_LABELS,
  deleteCoupon,
  listCoupons,
} from '@/shared/api/promotions.api';
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

export function CouponsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const deleteModal = useDisclosure();
  const { onSuccess, onError } = useAdminMutationFeedback();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<CouponDto | null>(null);

  const queryParams = useMemo(
    () => ({
      search: search || undefined,
      page,
      limit: PAGE_SIZE,
    }),
    [search, page],
  );

  const couponsQuery = useQuery({
    queryKey: ['admin', 'coupons', queryParams],
    queryFn: () => listCoupons(queryParams),
  });

  const items = couponsQuery.data?.items ?? [];
  const total = couponsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [search]);

  const deleteMutation = useMutation({
    mutationFn: () => deleteCoupon(toDelete!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      deleteModal.close();
      setToDelete(null);
      onSuccess('Kupon silindi.');
    },
    onError: (error) => onError(error, 'Kupon silinemedi.'),
  });

  return (
    <>
      <ListPageShell
        title="Kuponlar"
        description="İndirim kodlarını ve kullanım kurallarını yönetin"
        actions={
          <Button size="sm" onClick={() => navigate('/admin/promotions/coupons/new')}>
            <Plus className="h-4 w-4" />
            Yeni kupon
          </Button>
        }
        filters={
          <FilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Kupon kodu ara…"
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
              <TableHeaderCell>Kod</TableHeaderCell>
              <TableHeaderCell>Tip</TableHeaderCell>
              <TableHeaderCell>Değer</TableHeaderCell>
              <TableHeaderCell>Durum</TableHeaderCell>
              <TableHeaderCell className="text-right">İşlem</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableQueryState
              colSpan={5}
              isLoading={couponsQuery.isLoading}
              isError={couponsQuery.isError}
              isEmpty={items.length === 0}
              emptyMessage="Henüz kupon yok."
            >
              {items.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-mono font-medium">{coupon.code}</TableCell>
                  <TableCell>{COUPON_TYPE_LABELS[coupon.type]}</TableCell>
                  <TableCell>
                    {coupon.type === 'PERCENTAGE'
                      ? `%${coupon.value}`
                      : `${coupon.value} TL`}
                  </TableCell>
                  <TableCell>
                    <Badge variant={coupon.isActive ? 'success' : 'default'}>
                      {coupon.isActive ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          navigate(`/admin/promotions/coupons/${coupon.id}/edit`, {
                            state: { coupon },
                          })
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setToDelete(coupon);
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
        title="Kuponu sil"
        description={
          toDelete
            ? `"${toDelete.code}" kalıcı olarak silinecek.`
            : 'Bu kupon kalıcı olarak silinecek.'
        }
        confirmLabel="Sil"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />
    </>
  );
}
