import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SeoSettingDto } from '@/shared/types/api';
import { ApiError } from '@/shared/api/client';
import {
  getAdminSeoSettings,
  updateAdminSeoSettings,
} from '@/shared/api/seo.api';
import {
  Button,
  Card,
  CardHeader,
  Input,
  Label,
  MediaField,
  Textarea,
} from '@/shared/ui';

export function SeoSettingsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Partial<SeoSettingDto>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const settingsQuery = useQuery({
    queryKey: ['admin', 'seo-settings'],
    queryFn: getAdminSeoSettings,
  });

  useEffect(() => {
    if (settingsQuery.data) {
      setForm(settingsQuery.data);
    }
  }, [settingsQuery.data]);

  const saveMutation = useMutation({
    mutationFn: updateAdminSeoSettings,
    onSuccess: (data) => {
      setForm(data);
      setMessage('SEO ayarları kaydedildi.');
      setErrorMessage(null);
      queryClient.invalidateQueries({ queryKey: ['admin', 'seo-settings'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'seo-settings'] });
    },
    onError: (error) => {
      setMessage(null);
      setErrorMessage(
        error instanceof ApiError ? error.message : 'Kayıt başarısız',
      );
    },
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    saveMutation.mutate({
      defaultTitle: form.defaultTitle,
      defaultDescription: form.defaultDescription,
      defaultOgImageId: form.defaultOgImageId,
      robotsTxt: form.robotsTxt,
      googleAnalyticsId: form.googleAnalyticsId,
      metaPixelId: form.metaPixelId,
      canonicalBaseUrl: form.canonicalBaseUrl,
      sitemapIncludeProducts: form.sitemapIncludeProducts,
      sitemapIncludeCategories: form.sitemapIncludeCategories,
      sitemapIncludePages: form.sitemapIncludePages,
      sitemapIncludeBlogPosts: form.sitemapIncludeBlogPosts,
    });
  };

  const sitemapUrl =
    form.canonicalBaseUrl?.replace(/\/$/, '') || 'https://alanadiniz.com';

  if (settingsQuery.isLoading) {
    return <p className="text-sm text-slate-500">Yükleniyor…</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card padding="sm">
        <CardHeader
          title="Global meta"
          description="Entity SEO alanı boş olduğunda kullanılacak varsayılan değerler"
        />
        <div className="space-y-4">
          <div>
            <Label htmlFor="seo-default-title">Varsayılan başlık</Label>
            <Input
              id="seo-default-title"
              value={form.defaultTitle ?? ''}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, defaultTitle: e.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="seo-default-description">Varsayılan açıklama</Label>
            <Textarea
              id="seo-default-description"
              rows={3}
              value={form.defaultDescription ?? ''}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  defaultDescription: e.target.value,
                }))
              }
            />
          </div>
          <MediaField
            label="Varsayılan OG görseli"
            value={form.defaultOgImageId ?? null}
            onChange={(mediaId) =>
              setForm((prev) => ({ ...prev, defaultOgImageId: mediaId }))
            }
            folder="seo"
          />
          <div>
            <Label htmlFor="seo-canonical-base">Canonical taban URL</Label>
            <Input
              id="seo-canonical-base"
              placeholder="https://www.ornek.com"
              value={form.canonicalBaseUrl ?? ''}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  canonicalBaseUrl: e.target.value || null,
                }))
              }
            />
          </div>
        </div>
      </Card>

      <Card padding="sm">
        <CardHeader
          title="Robots.txt"
          description="Boş bırakılırsa varsayılan robots.txt üretilir"
        />
        <Textarea
          rows={8}
          className="font-mono text-sm"
          placeholder={`User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}/sitemap.xml`}
          value={form.robotsTxt ?? ''}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, robotsTxt: e.target.value }))
          }
        />
      </Card>

      <Card padding="sm">
        <CardHeader
          title="Sitemap"
          description="Dinamik sitemap.xml hangi içerik türlerini içerecek"
        />
        <p className="mb-4 text-sm text-slate-600">
          Sitemap adresi:{' '}
          <code className="rounded bg-slate-100 px-1.5 py-0.5">
            {sitemapUrl}/sitemap.xml
          </code>
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ['sitemapIncludeProducts', 'Ürünler / yazılımlar'],
              ['sitemapIncludeCategories', 'Kategoriler'],
              ['sitemapIncludePages', 'CMS sayfaları'],
              ['sitemapIncludeBlogPosts', 'Blog yazıları'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(form[key])}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, [key]: e.target.checked }))
                }
              />
              {label}
            </label>
          ))}
        </div>
      </Card>

      <Card padding="sm">
        <CardHeader
          title="Analytics & pixel"
          description="Public sitede otomatik enjekte edilir"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="seo-ga-id">Google Analytics ID</Label>
            <Input
              id="seo-ga-id"
              placeholder="G-XXXXXXXXXX"
              value={form.googleAnalyticsId ?? ''}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  googleAnalyticsId: e.target.value || null,
                }))
              }
            />
          </div>
          <div>
            <Label htmlFor="seo-pixel-id">Meta Pixel ID</Label>
            <Input
              id="seo-pixel-id"
              placeholder="1234567890"
              value={form.metaPixelId ?? ''}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  metaPixelId: e.target.value || null,
                }))
              }
            />
          </div>
        </div>
      </Card>

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {errorMessage ? (
        <p className="text-sm text-red-600">{errorMessage}</p>
      ) : null}

      <Button type="submit" disabled={saveMutation.isPending}>
        Kaydet
      </Button>
    </form>
  );
}
