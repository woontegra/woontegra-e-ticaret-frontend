import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { CampaignDto } from '@/shared/types/api';
import {
  CAMPAIGN_TYPE_LABELS,
  deleteCampaign,
  listCampaigns,
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

export function CampaignsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const deleteModal = useDisclosure();
  const { onSuccess, onError } = useAdminMutationFeedback();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<CampaignDto | null>(null);

  const queryParams = useMemo(
    () => ({
      search: search || undefined,
      page,
      limit: PAGE_SIZE,
    }),
    [search, page],
  );

  const campaignsQuery = useQuery({
    queryKey: ['admin', 'campaigns', queryParams],
    queryFn: () => listCampaigns(queryParams),
  });

  const items = campaignsQuery.data?.items ?? [];
  const total = campaignsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [search]);

  const deleteMutation = useMutation({
    mutationFn: () => deleteCampaign(toDelete!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'campaigns'] });
      deleteModal.close();
      setToDelete(null);
      onSuccess('Kampanya silindi.');
    },
    onError: (error) => onError(error, 'Kampanya silinemedi.'),
  });

  return (
    <>
      <ListPageShell
        title="Kampanyalar"
        description="Banner, promosyon ve kampanya içeriklerini yönetin"
        actions={
          <Button size="sm" onClick={() => navigate('/admin/promotions/campaigns/new')}>
            <Plus className="h-4 w-4" />
            Yeni kampanya
          </Button>
        }
        filters={
          <FilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Ad veya başlık ara…"
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
              <TableHeaderCell>Tip</TableHeaderCell>
              <TableHeaderCell>Başlık</TableHeaderCell>
              <TableHeaderCell>Durum</TableHeaderCell>
              <TableHeaderCell className="text-right">İşlem</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableQueryState
              colSpan={5}
              isLoading={campaignsQuery.isLoading}
              isError={campaignsQuery.isError}
              isEmpty={items.length === 0}
              emptyMessage="Henüz kampanya yok. İlk kampanyanızı oluşturun."
            >
              {items.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell>{CAMPAIGN_TYPE_LABELS[campaign.type]}</TableCell>
                  <TableCell>{campaign.title}</TableCell>
                  <TableCell>
                    <Badge variant={campaign.isActive ? 'success' : 'default'}>
                      {campaign.isActive ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          navigate(
                            `/admin/promotions/campaigns/${campaign.id}/edit`,
                            { state: { campaign } },
                          )
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setToDelete(campaign);
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
        title="Kampanyayı sil"
        description={
          toDelete
            ? `"${toDelete.name}" kalıcı olarak silinecek.`
            : 'Bu kampanya kalıcı olarak silinecek.'
        }
        confirmLabel="Sil"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />
    </>
  );
}
