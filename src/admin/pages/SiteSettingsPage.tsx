import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SiteSettingDto } from '@woontegra/shared';
import { ApiError } from '@/shared/api/client';
import {
  getAdminSiteSettings,
  updateAdminSiteSettings,
} from '@/shared/api/settings.api';
import {
  Button,
  Card,
  CardHeader,
  Input,
  Label,
  MediaField,
  Textarea,
} from '@/shared/ui';

export function SiteSettingsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Partial<SiteSettingDto>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const settingsQuery = useQuery({
    queryKey: ['admin', 'site-settings'],
    queryFn: getAdminSiteSettings,
  });

  useEffect(() => {
    if (settingsQuery.data) {
      setForm(settingsQuery.data);
    }
  }, [settingsQuery.data]);

  const saveMutation = useMutation({
    mutationFn: updateAdminSiteSettings,
    onSuccess: (data) => {
      setForm(data);
      setMessage('Site bilgileri kaydedildi.');
      setErrorMessage(null);
      queryClient.invalidateQueries({ queryKey: ['admin', 'site-settings'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'site-settings'] });
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
      siteName: form.siteName,
      siteDescription: form.siteDescription,
      defaultSeoTitle: form.defaultSeoTitle,
      defaultSeoDescription: form.defaultSeoDescription,
      domain: form.domain,
      maintenanceMode: form.maintenanceMode,
      logoMediaId: form.logoMediaId,
      faviconMediaId: form.faviconMediaId,
      ogImageMediaId: form.ogImageMediaId,
    });
  };

  if (settingsQuery.isLoading) {
    return <p className="text-sm text-slate-500">Yükleniyor…</p>;
  }

  return (
    <Card padding="sm">
      <CardHeader
        title="Site Bilgileri"
        description="Site adı, SEO varsayılanları ve bakım modu"
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label htmlFor="siteName" required>
              Site adı
            </Label>
            <Input
              id="siteName"
              value={form.siteName ?? ''}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, siteName: event.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="domain">Alan adı</Label>
            <Input
              id="domain"
              value={form.domain ?? ''}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, domain: event.target.value }))
              }
              placeholder="ornek.com"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="siteDescription">Site açıklaması</Label>
          <Textarea
            id="siteDescription"
            value={form.siteDescription ?? ''}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                siteDescription: event.target.value,
              }))
            }
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label htmlFor="defaultSeoTitle">Varsayılan SEO başlığı</Label>
            <Input
              id="defaultSeoTitle"
              value={form.defaultSeoTitle ?? ''}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  defaultSeoTitle: event.target.value,
                }))
              }
            />
          </div>
          <div>
            <Label htmlFor="defaultSeoDescription">
              Varsayılan SEO açıklaması
            </Label>
            <Input
              id="defaultSeoDescription"
              value={form.defaultSeoDescription ?? ''}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  defaultSeoDescription: event.target.value,
                }))
              }
            />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <MediaField
            label="Logo"
            value={form.logoMediaId ?? null}
            onChange={(logoMediaId) =>
              setForm((prev) => ({ ...prev, logoMediaId }))
            }
          />
          <MediaField
            label="Favicon"
            value={form.faviconMediaId ?? null}
            onChange={(faviconMediaId) =>
              setForm((prev) => ({ ...prev, faviconMediaId }))
            }
          />
          <MediaField
            label="OG görsel"
            value={form.ogImageMediaId ?? null}
            onChange={(ogImageMediaId) =>
              setForm((prev) => ({ ...prev, ogImageMediaId }))
            }
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.maintenanceMode ?? false}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                maintenanceMode: event.target.checked,
              }))
            }
            className="rounded border-slate-300"
          />
          Bakım modu aktif
        </label>

        {message ? (
          <p className="rounded-md bg-emerald-50 px-2 py-1.5 text-xs text-emerald-700">
            {message}
          </p>
        ) : null}
        {errorMessage ? (
          <p className="rounded-md bg-red-50 px-2 py-1.5 text-xs text-red-700">
            {errorMessage}
          </p>
        ) : null}

        <Button type="submit" isLoading={saveMutation.isPending}>
          Kaydet
        </Button>
      </form>
    </Card>
  );
}
