import { useMemo, useState } from 'react';
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

export function BlogPostsListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PageStatus | ''>('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [postToDelete, setPostToDelete] = useState<BlogPostDto | null>(null);

  const deleteModal = useDisclosure();

  const queryParams = useMemo(
    () => ({
      search: search || undefined,
      status: statusFilter || undefined,
      categoryId: categoryFilter || undefined,
    }),
    [search, statusFilter, categoryFilter],
  );

  const postsQuery = useQuery({
    queryKey: ['admin', 'blog', 'posts', queryParams],
    queryFn: () => listBlogPosts(queryParams),
  });

  const categoriesQuery = useQuery({
    queryKey: ['admin', 'blog', 'categories'],
    queryFn: listBlogCategories,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBlogPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'blog'] });
      deleteModal.close();
      setPostToDelete(null);
    },
  });

  return (
    <>
      <Card padding="sm">
        <CardHeader
          title="Blog Yazıları"
          description="Blog içeriklerini yönetin"
          action={
            <Button
              size="sm"
              onClick={() => navigate('/admin/content/blog/posts/new')}
            >
              <Plus className="h-4 w-4" />
              Yeni yazı
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
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="w-40"
          >
            <option value="">Tüm kategoriler</option>
            {(categoriesQuery.data ?? []).map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </FilterBar>

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
            {postsQuery.isLoading ? (
              <TableEmpty colSpan={4} message="Yükleniyor…" />
            ) : (postsQuery.data?.items.length ?? 0) === 0 ? (
              <TableEmpty colSpan={4} message="Blog yazısı bulunamadı" />
            ) : (
              postsQuery.data!.items.map((post) => (
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
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Yazıyı sil"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={deleteModal.close}>
              İptal
            </Button>
            <Button
              variant="danger"
              isLoading={deleteMutation.isPending}
              onClick={() => postToDelete && deleteMutation.mutate(postToDelete.id)}
            >
              Sil
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          <strong>{postToDelete?.title}</strong> kalıcı olarak silinecek.
        </p>
      </Modal>
    </>
  );
}
