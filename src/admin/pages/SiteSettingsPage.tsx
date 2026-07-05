import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SiteSettingDto, StorefrontUiLabels } from '@/shared/types/api';
import {
  getAdminSiteSettings,
  updateAdminSiteSettings,
} from '@/shared/api/settings.api';
import { STOREFRONT_UI_FIELD_GROUPS } from '@/admin/constants/storefront-ui-fields';
import { useAdminMutationFeedback } from '@/admin/hooks/useAdminMutationFeedback';
import {
  Button,
  Card,
  Input,
  Label,
  MediaField,
  Textarea,
} from '@/shared/ui';

export function SiteSettingsPage() {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = useAdminMutationFeedback();
  const [form, setForm] = useState<Partial<SiteSettingDto>>({});
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
      setErrorMessage(null);
      onSuccess('Site bilgileri kaydedildi.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'site-settings'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'site-settings'] });
    },
    onError: (error) => {
      const message = onError(error, 'Kayıt başarısız');
      setErrorMessage(message);
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
      storefrontUi: form.storefrontUi,
    });
  };

  const updateStorefrontUi = (
    key: keyof StorefrontUiLabels,
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      storefrontUi: {
        ...(prev.storefrontUi ?? {}),
        [key]: value,
      },
    }));
  };

  if (settingsQuery.isLoading) {
    return <p className="text-sm text-slate-500">Yükleniyor…</p>;
  }

  if (settingsQuery.isError) {
    return (
      <p className="text-sm text-red-600">Site ayarları yüklenemedi.</p>
    );
  }

  return (
    <Card padding="sm">
      <form onSubmit={handleSubmit} className="space-y-3">
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

        <div className="space-y-4 border-t border-slate-100 pt-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Vitrin arayüz metinleri
          </h2>
          <p className="text-xs text-slate-500">
            Public sitede görünen sabit metinler. Boş bırakılan alanlar sitede
            gösterilmez.
          </p>
          {STOREFRONT_UI_FIELD_GROUPS.map((group) => (
            <div key={group.title} className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {group.title}
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                {group.fields.map((field) => (
                  <div key={field.key}>
                    <Label htmlFor={`ui-${field.key}`}>{field.label}</Label>
                    <Input
                      id={`ui-${field.key}`}
                      value={form.storefrontUi?.[field.key] ?? ''}
                      onChange={(event) =>
                        updateStorefrontUi(field.key, event.target.value)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
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

        {errorMessage ? (
          <p className="text-xs text-red-600">{errorMessage}</p>
        ) : null}

        <Button type="submit" isLoading={saveMutation.isPending}>
          Kaydet
        </Button>
      </form>
    </Card>
  );
}
