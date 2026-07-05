import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import type { PageDto, PageStatus, PageType } from '@/shared/types/api';
import {
  deletePage,
  listPages,
  PAGE_STATUS_LABELS,
  PAGE_TYPE_LABELS,
} from '@/shared/api/pages.api';
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
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/shared/ui';

const PAGE_SIZE = 20;

export function PagesListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { onSuccess, onError } = useAdminMutationFeedback();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PageStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<PageType | ''>('');
  const [listPage, setListPage] = useState(1);
  const [pageToDelete, setPageToDelete] = useState<PageDto | null>(null);

  const deleteModal = useDisclosure();

  const queryParams = useMemo(
    () => ({
      search: search || undefined,
      status: statusFilter || undefined,
      pageType: typeFilter || undefined,
      page: listPage,
      limit: PAGE_SIZE,
    }),
    [search, statusFilter, typeFilter, listPage],
  );

  const pagesQuery = useQuery({
    queryKey: ['admin', 'pages', queryParams],
    queryFn: () => listPages(queryParams),
  });

  const items = pagesQuery.data?.items ?? [];
  const total = pagesQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    setListPage(1);
  }, [search, statusFilter, typeFilter]);

  const deleteMutation = useMutation({
    mutationFn: deletePage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pages'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'pages'] });
      deleteModal.close();
      setPageToDelete(null);
      onSuccess('Sayfa silindi.');
    },
    onError: (error) => onError(error, 'Sayfa silinemedi.'),
  });

  return (
    <>
      <ListPageShell
        title="Sayfalar"
        description="Statik sayfaları ve içeriklerini yönetin"
        actions={
          <Button size="sm" onClick={() => navigate('/admin/content/pages/new')}>
            <Plus className="h-4 w-4" />
            Yeni sayfa
          </Button>
        }
        filters={
          <FilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Başlık veya slug ara…"
          >
            <Select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as PageStatus | '')
              }
              className="h-8 text-xs"
            >
              <option value="">Tüm durumlar</option>
              <option value="DRAFT">Taslak</option>
              <option value="PUBLISHED">Yayında</option>
            </Select>
            <Select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(event.target.value as PageType | '')
              }
              className="h-8 text-xs"
            >
              <option value="">Tüm türler</option>
              <option value="STANDARD">Standart</option>
              <option value="LEGAL">Yasal</option>
              <option value="LANDING">Landing</option>
            </Select>
          </FilterBar>
        }
        footer={
          <Pagination
            page={listPage}
            totalPages={totalPages}
            total={total}
            pageSize={PAGE_SIZE}
            onPageChange={setListPage}
          />
        }
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Başlık</TableHeaderCell>
              <TableHeaderCell>Slug</TableHeaderCell>
              <TableHeaderCell>Tür</TableHeaderCell>
              <TableHeaderCell>Durum</TableHeaderCell>
              <TableHeaderCell className="text-right">İşlemler</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableQueryState
              colSpan={5}
              isLoading={pagesQuery.isLoading}
              isError={pagesQuery.isError}
              isEmpty={items.length === 0}
              emptyMessage="Sayfa bulunamadı"
            >
              {items.map((page) => (
                <TableRow key={page.id}>
                  <TableCell>
                    <p className="font-medium text-slate-900">{page.title}</p>
                    {page.excerpt ? (
                      <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                        {page.excerpt}
                      </p>
                    ) : null}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-600">
                    {page.slug}
                  </TableCell>
                  <TableCell>
                    <Badge>{PAGE_TYPE_LABELS[page.pageType]}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        page.status === 'PUBLISHED' ? 'success' : 'warning'
                      }
                    >
                      {PAGE_STATUS_LABELS[page.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      {page.status === 'PUBLISHED' ? (
                        <Link
                          to={`/sayfa/${page.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"
                          aria-label="Görüntüle"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      ) : null}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          navigate(`/admin/content/pages/${page.id}`)
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setPageToDelete(page);
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
      </ListPageShell>

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Sayfayı sil"
        description={
          pageToDelete
            ? `"${pageToDelete.title}" kalıcı olarak silinecek. Devam edilsin mi?`
            : 'Bu sayfa kalıcı olarak silinecek.'
        }
        confirmLabel="Sil"
        isLoading={deleteMutation.isPending}
        onConfirm={() =>
          pageToDelete && deleteMutation.mutate(pageToDelete.id)
        }
      />
    </>
  );
}
