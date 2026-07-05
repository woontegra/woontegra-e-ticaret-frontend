import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import type { PageDto, PageStatus, PageType } from '@/shared/types/api';
import { ApiError } from '@/shared/api/client';
import {
  deletePage,
  listPages,
  PAGE_STATUS_LABELS,
  PAGE_TYPE_LABELS,
} from '@/shared/api/pages.api';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  FilterBar,
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

export function PagesListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PageStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<PageType | ''>('');
  const [pageToDelete, setPageToDelete] = useState<PageDto | null>(null);

  const deleteModal = useDisclosure();

  const queryParams = useMemo(
    () => ({
      search: search || undefined,
      status: statusFilter || undefined,
      pageType: typeFilter || undefined,
    }),
    [search, statusFilter, typeFilter],
  );

  const pagesQuery = useQuery({
    queryKey: ['admin', 'pages', queryParams],
    queryFn: () => listPages(queryParams),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pages'] });
      deleteModal.close();
      setPageToDelete(null);
    },
  });

  return (
    <>
      <Card padding="sm">
        <CardHeader
          title="Sayfalar"
          description="CMS sayfalarını yönetin"
          action={
            <Button size="sm" onClick={() => navigate('/admin/content/pages/new')}>
              <Plus className="h-4 w-4" />
              Yeni sayfa
            </Button>
          }
        />

        <FilterBar
          className="mb-4"
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Başlık veya slug ara…"
        >
          <Select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as PageStatus | '')
            }
            className="w-36"
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
            className="w-36"
          >
            <option value="">Tüm türler</option>
            <option value="STANDARD">Standart</option>
            <option value="LEGAL">Yasal</option>
            <option value="LANDING">Landing</option>
          </Select>
        </FilterBar>

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
            {pagesQuery.isLoading ? (
              <TableEmpty colSpan={5} message="Yükleniyor…" />
            ) : (pagesQuery.data?.items.length ?? 0) === 0 ? (
              <TableEmpty colSpan={5} message="Sayfa bulunamadı" />
            ) : (
              pagesQuery.data!.items.map((page) => (
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
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Sayfayı sil"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={deleteModal.close}>
              İptal
            </Button>
            <Button
              variant="danger"
              isLoading={deleteMutation.isPending}
              onClick={() => pageToDelete && deleteMutation.mutate(pageToDelete.id)}
            >
              Sil
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          <strong>{pageToDelete?.title}</strong> kalıcı olarak silinecek.
        </p>
        {deleteMutation.error instanceof ApiError ? (
          <p className="mt-2 text-sm text-red-600">{deleteMutation.error.message}</p>
        ) : null}
      </Modal>
    </>
  );
}
