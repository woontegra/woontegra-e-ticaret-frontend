import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { BlogPostDto, PageStatus } from '@/shared/types/api';
import { ApiError } from '@/shared/api/client';
import {
  BLOG_STATUS_LABELS,
  createBlogPost,
  getBlogPost,
  listBlogCategories,
  publishBlogPost,
  slugifyClient,
  unpublishBlogPost,
  updateBlogPost,
} from '@/shared/api/blog.api';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Input,
  Label,
  MediaField,
  RichTextEditor,
  Select,
  Textarea,
} from '@/shared/ui';

type Tab = 'content' | 'seo';

const emptyForm = (): Partial<BlogPostDto> & { tagsInput: string } => ({
  title: '',
  slug: '',
  status: 'DRAFT',
  excerpt: '',
  contentHtml: '',
  coverImageId: null,
  categoryId: null,
  authorName: '',
  readingTime: null,
  tags: [],
  tagsInput: '',
  seoTitle: '',
  seoDescription: '',
  ogImageId: null,
  robotsIndex: true,
});

export function BlogPostEditPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<Tab>('content');
  const [form, setForm] = useState(emptyForm());
  const [slugTouched, setSlugTouched] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const postQuery = useQuery({
    queryKey: ['admin', 'blog', 'posts', id],
    queryFn: () => getBlogPost(id!),
    enabled: !isNew && Boolean(id),
  });

  const categoriesQuery = useQuery({
    queryKey: ['admin', 'blog', 'categories'],
    queryFn: listBlogCategories,
  });

  useEffect(() => {
    if (postQuery.data) {
      setForm({
        ...postQuery.data,
        tagsInput: postQuery.data.tags.join(', '),
      });
      setSlugTouched(true);
    }
  }, [postQuery.data]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'blog'] });
    queryClient.invalidateQueries({ queryKey: ['public', 'blog'] });
  };

  const buildPayload = () => ({
    title: form.title,
    slug: form.slug,
    status: form.status,
    excerpt: form.excerpt || null,
    contentHtml: form.contentHtml,
    coverImageId: form.coverImageId,
    categoryId: form.categoryId || null,
    authorName: form.authorName || null,
    readingTime: form.readingTime,
    tags: form.tagsInput
      ? form.tagsInput.split(',').map((tag) => tag.trim()).filter(Boolean)
      : [],
    seoTitle: form.seoTitle || null,
    seoDescription: form.seoDescription || null,
    ogImageId: form.ogImageId,
    robotsIndex: form.robotsIndex,
  });

  const saveMutation = useMutation({
    mutationFn: async () =>
      isNew ? createBlogPost(buildPayload()) : updateBlogPost(id!, buildPayload()),
    onSuccess: (data) => {
      setForm({ ...data, tagsInput: data.tags.join(', ') });
      invalidate();
      setMessage('Yazı kaydedildi.');
      setErrorMessage(null);
      if (isNew) {
        navigate(`/admin/content/blog/posts/${data.id}`, { replace: true });
      }
    },
    onError: (error) => {
      setMessage(null);
      setErrorMessage(
        error instanceof ApiError ? error.message : 'Kayıt başarısız',
      );
    },
  });

  const publishMutation = useMutation({
    mutationFn: () => publishBlogPost(id!),
    onSuccess: (data) => {
      setForm({ ...data, tagsInput: data.tags.join(', ') });
      invalidate();
      setMessage('Yazı yayınlandı.');
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: () => unpublishBlogPost(id!),
    onSuccess: (data) => {
      setForm({ ...data, tagsInput: data.tags.join(', ') });
      invalidate();
      setMessage('Yazı taslağa alındı.');
    },
  });

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      ...(!slugTouched ? { slug: slugifyClient(title) } : {}),
    }));
  };

  if (!isNew && postQuery.isLoading) {
    return <p className="text-sm text-slate-500">Yükleniyor…</p>;
  }

  return (
    <Card padding="sm">
      <CardHeader
        title={isNew ? 'Yeni blog yazısı' : 'Blog yazısı düzenle'}
        description={form.slug ? `/blog/${form.slug}` : undefined}
        action={
          <div className="flex flex-wrap gap-2">
            {!isNew && form.status === 'DRAFT' ? (
              <Button
                variant="secondary"
                size="sm"
                isLoading={publishMutation.isPending}
                onClick={() => publishMutation.mutate()}
              >
                Yayınla
              </Button>
            ) : null}
            {!isNew && form.status === 'PUBLISHED' ? (
              <Button
                variant="secondary"
                size="sm"
                isLoading={unpublishMutation.isPending}
                onClick={() => unpublishMutation.mutate()}
              >
                Taslağa al
              </Button>
            ) : null}
            <Button
              size="sm"
              isLoading={saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
            >
              Kaydet
            </Button>
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {form.status ? (
          <Badge variant={form.status === 'PUBLISHED' ? 'success' : 'warning'}>
            {BLOG_STATUS_LABELS[form.status]}
          </Badge>
        ) : null}
        <Link
          to="/admin/content/blog/posts"
          className="ml-auto text-xs text-slate-500 hover:text-slate-800"
        >
          ← Blog yazılarına dön
        </Link>
      </div>

      {message ? <p className="mb-3 text-sm text-emerald-600">{message}</p> : null}
      {errorMessage ? (
        <p className="mb-3 text-sm text-red-600">{errorMessage}</p>
      ) : null}

      <div className="mb-4 flex gap-1 border-b border-slate-100">
        <TabButton active={tab === 'content'} onClick={() => setTab('content')}>
          İçerik
        </TabButton>
        <TabButton active={tab === 'seo'} onClick={() => setTab('seo')}>
          SEO
        </TabButton>
      </div>

      {tab === 'content' ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="post-title" required>
                Başlık
              </Label>
              <Input
                id="post-title"
                value={form.title ?? ''}
                onChange={(event) => handleTitleChange(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="post-slug" required>
                Slug
              </Label>
              <Input
                id="post-slug"
                value={form.slug ?? ''}
                onChange={(event) => {
                  setSlugTouched(true);
                  setForm((prev) => ({
                    ...prev,
                    slug: slugifyClient(event.target.value),
                  }));
                }}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="post-category">Kategori</Label>
              <Select
                id="post-category"
                value={form.categoryId ?? ''}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    categoryId: event.target.value || null,
                  }))
                }
              >
                <option value="">Kategori seçin</option>
                {(categoriesQuery.data ?? [])
                  .filter((category) => category.isActive)
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="post-status">Durum</Label>
              <Select
                id="post-status"
                value={form.status ?? 'DRAFT'}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    status: event.target.value as PageStatus,
                  }))
                }
              >
                <option value="DRAFT">Taslak</option>
                <option value="PUBLISHED">Yayında</option>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="post-author">Yazar adı</Label>
              <Input
                id="post-author"
                value={form.authorName ?? ''}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, authorName: event.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="post-reading-time">Okuma süresi (dk)</Label>
              <Input
                id="post-reading-time"
                type="number"
                min={1}
                value={form.readingTime ?? ''}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    readingTime: event.target.value
                      ? Number(event.target.value)
                      : null,
                  }))
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="post-excerpt">Özet</Label>
            <Textarea
              id="post-excerpt"
              rows={2}
              value={form.excerpt ?? ''}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, excerpt: event.target.value }))
              }
            />
          </div>

          <div>
            <Label htmlFor="post-tags">Etiketler</Label>
            <Input
              id="post-tags"
              value={form.tagsInput ?? ''}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, tagsInput: event.target.value }))
              }
              placeholder="e-ticaret, ipuçları, rehber"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Virgülle ayırın
            </p>
          </div>

          <MediaField
            label="Kapak görseli"
            value={form.coverImageId ?? null}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, coverImageId: value }))
            }
            folder="blog"
          />

          <div>
            <Label>İçerik</Label>
            <RichTextEditor
              key={isNew ? 'new' : form.id}
              value={form.contentHtml ?? ''}
              onChange={(html) =>
                setForm((prev) => ({ ...prev, contentHtml: html }))
              }
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <Label htmlFor="seo-title">SEO başlık</Label>
            <Input
              id="seo-title"
              value={form.seoTitle ?? ''}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, seoTitle: event.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="seo-description">SEO açıklama</Label>
            <Textarea
              id="seo-description"
              rows={3}
              value={form.seoDescription ?? ''}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  seoDescription: event.target.value,
                }))
              }
            />
          </div>
          <MediaField
            label="OG görsel"
            value={form.ogImageId ?? null}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, ogImageId: value }))
            }
            folder="blog"
          />
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.robotsIndex ?? true}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  robotsIndex: event.target.checked,
                }))
              }
              className="rounded border-slate-300"
            />
            Arama motorlarında indekslensin
          </label>
        </div>
      )}
    </Card>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border-b-2 px-3 py-2 text-sm font-medium transition ${
        active
          ? 'border-slate-900 text-slate-900'
          : 'border-transparent text-slate-500 hover:text-slate-700'
      }`}
    >
      {children}
    </button>
  );
}
