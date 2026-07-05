import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import type { BlogPostDto, PageStatus } from '@/shared/types/api';
import {
  BLOG_STATUS_LABELS,
  deleteBlogPost,
  listBlogCategories,
  listBlogPosts,
} from '@/shared/api/blog.api';
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

export function BlogPostsListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { onSuccess, onError } = useAdminMutationFeedback();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PageStatus | ''>('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [postToDelete, setPostToDelete] = useState<BlogPostDto | null>(null);

  const deleteModal = useDisclosure();

  const queryParams = useMemo(
    () => ({
      search: search || undefined,
      status: statusFilter || undefined,
      categoryId: categoryFilter || undefined,
      page,
      limit: PAGE_SIZE,
    }),
    [search, statusFilter, categoryFilter, page],
  );

  const postsQuery = useQuery({
    queryKey: ['admin', 'blog', 'posts', queryParams],
    queryFn: () => listBlogPosts(queryParams),
  });

  const categoriesQuery = useQuery({
    queryKey: ['admin', 'blog', 'categories'],
    queryFn: listBlogCategories,
  });

  const items = postsQuery.data?.items ?? [];
  const total = postsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, categoryFilter]);

  const deleteMutation = useMutation({
    mutationFn: deleteBlogPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'blog'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'blog'] });
      deleteModal.close();
      setPostToDelete(null);
      onSuccess('Yazı silindi.');
    },
    onError: (error) => onError(error, 'Yazı silinemedi.'),
  });

  return (
    <>
      <ListPageShell
        title="Blog Yazıları"
        description="Blog içeriklerini ve yayın durumlarını yönetin"
        actions={
          <Button
            size="sm"
            onClick={() => navigate('/admin/content/blog/posts/new')}
          >
            <Plus className="h-4 w-4" />
            Yeni yazı
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
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="h-8 text-xs"
            >
              <option value="">Tüm kategoriler</option>
              {(categoriesQuery.data ?? []).map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </FilterBar>
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
              <TableHeaderCell>Başlık</TableHeaderCell>
              <TableHeaderCell>Kategori</TableHeaderCell>
              <TableHeaderCell>Durum</TableHeaderCell>
              <TableHeaderCell className="text-right">İşlemler</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableQueryState
              colSpan={4}
              isLoading={postsQuery.isLoading}
              isError={postsQuery.isError}
              isEmpty={items.length === 0}
              emptyMessage="Blog yazısı bulunamadı"
            >
              {items.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <p className="font-medium text-slate-900">{post.title}</p>
                    <p className="text-xs text-slate-500">{post.slug}</p>
                  </TableCell>
                  <TableCell>
                    {post.category ? (
                      <Badge>{post.category.name}</Badge>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        post.status === 'PUBLISHED' ? 'success' : 'warning'
                      }
                    >
                      {BLOG_STATUS_LABELS[post.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      {post.status === 'PUBLISHED' ? (
                        <Link
                          to={`/blog/${post.slug}`}
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
                          navigate(`/admin/content/blog/posts/${post.id}`)
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setPostToDelete(post);
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
        title="Yazıyı sil"
        description={
          postToDelete
            ? `"${postToDelete.title}" kalıcı olarak silinecek. Devam edilsin mi?`
            : 'Bu yazı kalıcı olarak silinecek.'
        }
        confirmLabel="Sil"
        isLoading={deleteMutation.isPending}
        onConfirm={() =>
          postToDelete && deleteMutation.mutate(postToDelete.id)
        }
      />
    </>
  );
}
