import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PageDto, PageStatus, PageType } from '@/shared/types/api';
import { ApiError } from '@/shared/api/client';
import {
  createPage,
  getPage,
  PAGE_STATUS_LABELS,
  PAGE_TYPE_LABELS,
  publishPage,
  slugifyClient,
  unpublishPage,
  updatePage,
} from '@/shared/api/pages.api';
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

const emptyForm = (): Partial<PageDto> => ({
  title: '',
  slug: '',
  status: 'DRAFT',
  pageType: 'STANDARD',
  excerpt: '',
  contentHtml: '',
  featuredImageId: null,
  seoTitle: '',
  seoDescription: '',
  ogImageId: null,
  canonicalUrl: '',
  robotsIndex: true,
});

export function PageEditPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<Tab>('content');
  const [form, setForm] = useState<Partial<PageDto>>(emptyForm());
  const [slugTouched, setSlugTouched] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pageQuery = useQuery({
    queryKey: ['admin', 'pages', id],
    queryFn: () => getPage(id!),
    enabled: !isNew && Boolean(id),
  });

  useEffect(() => {
    if (pageQuery.data) {
      setForm(pageQuery.data);
      setSlugTouched(true);
    }
  }, [pageQuery.data]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'pages'] });
    queryClient.invalidateQueries({ queryKey: ['public', 'pages'] });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title,
        slug: form.slug,
        status: form.status,
        pageType: form.pageType,
        excerpt: form.excerpt || null,
        contentHtml: form.contentHtml,
        featuredImageId: form.featuredImageId,
        seoTitle: form.seoTitle || null,
        seoDescription: form.seoDescription || null,
        ogImageId: form.ogImageId,
        canonicalUrl: form.canonicalUrl || null,
        robotsIndex: form.robotsIndex,
      };

      if (isNew) {
        return createPage(payload);
      }

      return updatePage(id!, payload);
    },
    onSuccess: (data) => {
      setForm(data);
      invalidate();
      setMessage('Sayfa kaydedildi.');
      setErrorMessage(null);
      if (isNew) {
        navigate(`/admin/content/pages/${data.id}`, { replace: true });
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
    mutationFn: () => publishPage(id!),
    onSuccess: (data) => {
      setForm(data);
      invalidate();
      setMessage('Sayfa yayınlandı.');
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: () => unpublishPage(id!),
    onSuccess: (data) => {
      setForm(data);
      invalidate();
      setMessage('Sayfa taslağa alındı.');
    },
  });

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      ...(!slugTouched ? { slug: slugifyClient(title) } : {}),
    }));
  };

  if (!isNew && pageQuery.isLoading) {
    return <p className="text-sm text-slate-500">Yükleniyor…</p>;
  }

  return (
    <Card padding="sm">
      <CardHeader
        title={isNew ? 'Yeni sayfa' : 'Sayfa düzenle'}
        description={
          form.slug ? `/sayfa/${form.slug}` : 'Slug kayıttan sonra oluşur'
        }
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
            {PAGE_STATUS_LABELS[form.status]}
          </Badge>
        ) : null}
        {form.pageType ? (
          <Badge>{PAGE_TYPE_LABELS[form.pageType]}</Badge>
        ) : null}
        <Link
          to="/admin/content/pages"
          className="ml-auto text-xs text-slate-500 hover:text-slate-800"
        >
          ← Sayfalara dön
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
              <Label htmlFor="page-title" required>
                Başlık
              </Label>
              <Input
                id="page-title"
                value={form.title ?? ''}
                onChange={(event) => handleTitleChange(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="page-slug" required>
                Slug
              </Label>
              <Input
                id="page-slug"
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
              <Label htmlFor="page-type">Sayfa türü</Label>
              <Select
                id="page-type"
                value={form.pageType ?? 'STANDARD'}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    pageType: event.target.value as PageType,
                  }))
                }
              >
                <option value="STANDARD">Standart</option>
                <option value="LEGAL">Yasal</option>
                <option value="LANDING">Landing</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="page-status">Durum</Label>
              <Select
                id="page-status"
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

          <div>
            <Label htmlFor="page-excerpt">Özet</Label>
            <Textarea
              id="page-excerpt"
              rows={2}
              value={form.excerpt ?? ''}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, excerpt: event.target.value }))
              }
            />
          </div>

          <MediaField
            label="Öne çıkan görsel"
            value={form.featuredImageId ?? null}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, featuredImageId: value }))
            }
            folder="pages"
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
            folder="pages"
          />
          <div>
            <Label htmlFor="canonical-url">Canonical URL</Label>
            <Input
              id="canonical-url"
              value={form.canonicalUrl ?? ''}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  canonicalUrl: event.target.value,
                }))
              }
              placeholder="https://"
            />
          </div>
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
            Arama motorlarında indekslensin (robots index)
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
