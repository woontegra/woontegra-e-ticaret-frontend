import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import type { HeaderSettingDto } from '@/shared/types/api';
import {
  getHeaderSettings,
  HEADER_LOGO_POSITION_LABELS,
  HEADER_MENU_POSITION_LABELS,
  updateHeaderSettings,
} from '@/shared/api/header.api';
import { getAdminSiteSettings } from '@/shared/api/settings.api';
import { useAdminMutationFeedback } from '@/admin/hooks/useAdminMutationFeedback';
import {
  Button,
  Card,
  CardHeader,
  Input,
  Label,
  Select,
  Textarea,
} from '@/shared/ui';

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || '#000000'}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-12 cursor-pointer rounded border border-slate-200"
        />
        <Input value={value} onChange={(event) => onChange(event.target.value)} />
      </div>
    </div>
  );
}

export function HeaderSettingsPage() {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = useAdminMutationFeedback();
  const [form, setForm] = useState<HeaderSettingDto | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const settingsQuery = useQuery({
    queryKey: ['admin', 'header-settings'],
    queryFn: getHeaderSettings,
  });

  const siteQuery = useQuery({
    queryKey: ['admin', 'site-settings'],
    queryFn: getAdminSiteSettings,
  });

  useEffect(() => {
    if (settingsQuery.data) {
      setForm(settingsQuery.data);
    }
  }, [settingsQuery.data]);

  const saveMutation = useMutation({
    mutationFn: updateHeaderSettings,
    onSuccess: (data) => {
      setForm(data);
      setErrorMessage(null);
      onSuccess('Header ayarları kaydedildi.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'header-settings'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'header-settings'] });
    },
    onError: (error) => {
      const message = onError(error, 'Kayıt başarısız');
      setErrorMessage(message);
    },
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!form) return;

    saveMutation.mutate({
      logoPosition: form.logoPosition,
      menuPosition: form.menuPosition,
      headerHeight: form.headerHeight,
      stickyHeader: form.stickyHeader,
      showSearch: form.showSearch,
      showAccountIcon: form.showAccountIcon,
      showFavoritesIcon: form.showFavoritesIcon,
      showCartIcon: form.showCartIcon,
      topBarEnabled: form.topBarEnabled,
      topBarText: form.topBarText,
      topBarBackground: form.topBarBackground,
      topBarTextColor: form.topBarTextColor,
      announcementEnabled: form.announcementEnabled,
      announcementText: form.announcementText,
      announcementLink: form.announcementLink,
      accountUrl: form.accountUrl,
      searchPlaceholder: form.searchPlaceholder,
      cartUrl: form.cartUrl,
      favoritesUrl: form.favoritesUrl,
    });
  };

  if (settingsQuery.isLoading || !form) {
    return <p className="text-sm text-slate-500">Yükleniyor…</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card padding="sm">
        <CardHeader
          title="Logo"
          description="Logo Site Bilgileri ayarlarından yönetilir"
        />
        <div className="flex items-start gap-4">
          {siteQuery.data?.logoUrl ? (
            <img
              src={siteQuery.data.logoUrl}
              alt={siteQuery.data.siteName || 'Logo'}
              className="h-12 max-w-[180px] object-contain"
            />
          ) : (
            <p className="text-sm text-slate-500">Henüz logo yüklenmemiş.</p>
          )}
          <Link
            to="/admin/settings/site"
            className="text-sm text-slate-600 underline-offset-2 hover:underline"
          >
            Site Bilgileri → Logo düzenle
          </Link>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="logo-position">Logo pozisyonu</Label>
            <Select
              id="logo-position"
              value={form.logoPosition}
              onChange={(event) =>
                setForm((prev) =>
                  prev
                    ? {
                        ...prev,
                        logoPosition: event.target.value as HeaderSettingDto['logoPosition'],
                      }
                    : prev,
                )
              }
            >
              {Object.entries(HEADER_LOGO_POSITION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="menu-position">Menü pozisyonu</Label>
            <Select
              id="menu-position"
              value={form.menuPosition}
              onChange={(event) =>
                setForm((prev) =>
                  prev
                    ? {
                        ...prev,
                        menuPosition: event.target.value as HeaderSettingDto['menuPosition'],
                      }
                    : prev,
                )
              }
            >
              {Object.entries(HEADER_MENU_POSITION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="header-height">Header yüksekliği</Label>
            <Input
              id="header-height"
              value={form.headerHeight}
              onChange={(event) =>
                setForm((prev) =>
                  prev ? { ...prev, headerHeight: event.target.value } : prev,
                )
              }
              placeholder="3.5rem"
            />
          </div>
          <label className="flex items-center gap-2 self-end text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.stickyHeader}
              onChange={(event) =>
                setForm((prev) =>
                  prev ? { ...prev, stickyHeader: event.target.checked } : prev,
                )
              }
              className="rounded border-slate-300"
            />
            Yapışkan header (sticky)
          </label>
        </div>
      </Card>

      <Card padding="sm">
        <CardHeader title="Header ikonları" />
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { key: 'showSearch' as const, label: 'Arama ikonu' },
            { key: 'showAccountIcon' as const, label: 'Hesap ikonu' },
            { key: 'showFavoritesIcon' as const, label: 'Favoriler ikonu' },
            { key: 'showCartIcon' as const, label: 'Sepet ikonu' },
          ].map((item) => (
            <label
              key={item.key}
              className="flex items-center gap-2 text-sm text-slate-700"
            >
              <input
                type="checkbox"
                checked={form[item.key]}
                onChange={(event) =>
                  setForm((prev) =>
                    prev ? { ...prev, [item.key]: event.target.checked } : prev,
                  )
                }
                className="rounded border-slate-300"
              />
              {item.label}
            </label>
          ))}
        </div>
      </Card>

      <Card padding="sm">
        <CardHeader title="Bağlantılar ve arama" />
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="account-url">Hesap ikonu URL</Label>
            <Input
              id="account-url"
              value={form.accountUrl ?? ''}
              onChange={(event) =>
                setForm((prev) =>
                  prev
                    ? { ...prev, accountUrl: event.target.value || null }
                    : prev,
                )
              }
              placeholder="/admin/login veya https://..."
            />
          </div>
          <div>
            <Label htmlFor="cart-url">Sepet URL</Label>
            <Input
              id="cart-url"
              value={form.cartUrl ?? ''}
              onChange={(event) =>
                setForm((prev) =>
                  prev ? { ...prev, cartUrl: event.target.value || null } : prev,
                )
              }
              placeholder="/sepet"
            />
          </div>
          <div>
            <Label htmlFor="favorites-url">Favoriler URL</Label>
            <Input
              id="favorites-url"
              value={form.favoritesUrl ?? ''}
              onChange={(event) =>
                setForm((prev) =>
                  prev
                    ? { ...prev, favoritesUrl: event.target.value || null }
                    : prev,
                )
              }
              placeholder="/favoriler veya https://..."
            />
            <p className="mt-1 text-xs text-slate-500">
              Favoriler ikonu yalnızca bu alan doluysa görünür.
            </p>
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="search-placeholder">Arama placeholder</Label>
            <Input
              id="search-placeholder"
              value={form.searchPlaceholder ?? ''}
              onChange={(event) =>
                setForm((prev) =>
                  prev
                    ? { ...prev, searchPlaceholder: event.target.value || null }
                    : prev,
                )
              }
            />
          </div>
        </div>
      </Card>

      <Card padding="sm">
        <CardHeader title="Top bar" description="Header üstündeki ince bilgi şeridi" />
        <label className="mb-3 flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.topBarEnabled}
            onChange={(event) =>
              setForm((prev) =>
                prev ? { ...prev, topBarEnabled: event.target.checked } : prev,
              )
            }
            className="rounded border-slate-300"
          />
          Top bar aktif
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label htmlFor="top-bar-text">Top bar metni</Label>
            <Input
              id="top-bar-text"
              value={form.topBarText ?? ''}
              onChange={(event) =>
                setForm((prev) =>
                  prev
                    ? { ...prev, topBarText: event.target.value || null }
                    : prev,
                )
              }
            />
          </div>
          <ColorField
            label="Arka plan rengi"
            value={form.topBarBackground ?? '#0f172a'}
            onChange={(value) =>
              setForm((prev) => (prev ? { ...prev, topBarBackground: value } : prev))
            }
          />
          <ColorField
            label="Metin rengi"
            value={form.topBarTextColor ?? '#ffffff'}
            onChange={(value) =>
              setForm((prev) => (prev ? { ...prev, topBarTextColor: value } : prev))
            }
          />
        </div>
      </Card>

      <Card padding="sm">
        <CardHeader title="Duyuru barı" />
        <label className="mb-3 flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.announcementEnabled}
            onChange={(event) =>
              setForm((prev) =>
                prev
                  ? { ...prev, announcementEnabled: event.target.checked }
                  : prev,
              )
            }
            className="rounded border-slate-300"
          />
          Duyuru barı aktif
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label htmlFor="announcement-text">Duyuru metni</Label>
            <Textarea
              id="announcement-text"
              rows={2}
              value={form.announcementText ?? ''}
              onChange={(event) =>
                setForm((prev) =>
                  prev
                    ? { ...prev, announcementText: event.target.value || null }
                    : prev,
                )
              }
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="announcement-link">Duyuru linki (opsiyonel)</Label>
            <Input
              id="announcement-link"
              value={form.announcementLink ?? ''}
              onChange={(event) =>
                setForm((prev) =>
                  prev
                    ? { ...prev, announcementLink: event.target.value || null }
                    : prev,
                )
              }
              placeholder="/kampanya veya https://..."
            />
          </div>
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" isLoading={saveMutation.isPending}>
          Kaydet
        </Button>
        {errorMessage ? (
          <p className="text-sm text-red-600">{errorMessage}</p>
        ) : null}
      </div>
    </form>
  );
}
