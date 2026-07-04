import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CompanySettingDto, SocialLinks } from '@/shared/types/api';
import { ApiError } from '@/shared/api/client';
import {
  getAdminCompanySettings,
  updateAdminCompanySettings,
} from '@/shared/api/settings.api';
import {
  Button,
  Card,
  CardHeader,
  Input,
  Label,
  Textarea,
} from '@/shared/ui';

const socialFields: Array<{ key: keyof SocialLinks; label: string }> = [
  { key: 'facebook', label: 'Facebook' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'twitter', label: 'X (Twitter)' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'tiktok', label: 'TikTok' },
];

export function CompanySettingsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Partial<CompanySettingDto>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const settingsQuery = useQuery({
    queryKey: ['admin', 'company-settings'],
    queryFn: getAdminCompanySettings,
  });

  useEffect(() => {
    if (settingsQuery.data) {
      setForm(settingsQuery.data);
    }
  }, [settingsQuery.data]);

  const saveMutation = useMutation({
    mutationFn: updateAdminCompanySettings,
    onSuccess: (data) => {
      setForm(data);
      setMessage('Firma bilgileri kaydedildi.');
      setErrorMessage(null);
      queryClient.invalidateQueries({ queryKey: ['admin', 'company-settings'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'company-settings'] });
    },
    onError: (error) => {
      setMessage(null);
      setErrorMessage(
        error instanceof ApiError ? error.message : 'Kayıt başarısız',
      );
    },
  });

  const updateSocial = (key: keyof SocialLinks, value: string) => {
    setForm((prev) => ({
      ...prev,
      socialLinks: {
        ...(prev.socialLinks ?? {}),
        [key]: value,
      },
    }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    saveMutation.mutate({
      companyName: form.companyName,
      tradeName: form.tradeName,
      taxNumber: form.taxNumber,
      taxOffice: form.taxOffice,
      mersisNumber: form.mersisNumber,
      address: form.address,
      city: form.city,
      district: form.district,
      phone: form.phone,
      whatsapp: form.whatsapp,
      email: form.email,
      supportEmail: form.supportEmail,
      workingHours: form.workingHours,
      currency: form.currency,
      defaultTaxRate: form.defaultTaxRate,
      socialLinks: form.socialLinks,
    });
  };

  if (settingsQuery.isLoading) {
    return <p className="text-sm text-slate-500">Yükleniyor…</p>;
  }

  return (
    <Card padding="sm">
      <CardHeader
        title="Firma / İletişim Bilgileri"
        description="Footer, iletişim sayfası ve yasal bilgiler için"
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label htmlFor="companyName" required>
              Firma adı
            </Label>
            <Input
              id="companyName"
              value={form.companyName ?? ''}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, companyName: event.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="tradeName">Ticari unvan</Label>
            <Input
              id="tradeName"
              value={form.tradeName ?? ''}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, tradeName: event.target.value }))
              }
            />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <Label htmlFor="taxNumber">Vergi no</Label>
            <Input
              id="taxNumber"
              value={form.taxNumber ?? ''}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, taxNumber: event.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="taxOffice">Vergi dairesi</Label>
            <Input
              id="taxOffice"
              value={form.taxOffice ?? ''}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, taxOffice: event.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="mersisNumber">MERSİS no</Label>
            <Input
              id="mersisNumber"
              value={form.mersisNumber ?? ''}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  mersisNumber: event.target.value || null,
                }))
              }
            />
          </div>
        </div>

        <div>
          <Label htmlFor="address">Adres</Label>
          <Textarea
            id="address"
            value={form.address ?? ''}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, address: event.target.value }))
            }
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label htmlFor="city">İl</Label>
            <Input
              id="city"
              value={form.city ?? ''}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, city: event.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="district">İlçe</Label>
            <Input
              id="district"
              value={form.district ?? ''}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, district: event.target.value }))
              }
            />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              value={form.phone ?? ''}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, phone: event.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              value={form.whatsapp ?? ''}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, whatsapp: event.target.value }))
              }
            />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              type="email"
              value={form.email ?? ''}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, email: event.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="supportEmail">Destek e-posta</Label>
            <Input
              id="supportEmail"
              type="email"
              value={form.supportEmail ?? ''}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  supportEmail: event.target.value,
                }))
              }
            />
          </div>
        </div>

        <div>
          <Label htmlFor="workingHours">Çalışma saatleri</Label>
          <Input
            id="workingHours"
            value={form.workingHours ?? ''}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, workingHours: event.target.value }))
            }
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label htmlFor="currency">Para birimi</Label>
            <Input
              id="currency"
              value={form.currency ?? 'TRY'}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, currency: event.target.value }))
              }
              maxLength={3}
            />
          </div>
          <div>
            <Label htmlFor="defaultTaxRate">Varsayılan KDV (%)</Label>
            <Input
              id="defaultTaxRate"
              type="number"
              min={0}
              max={100}
              step={0.01}
              value={form.defaultTaxRate ?? 20}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  defaultTaxRate: Number(event.target.value),
                }))
              }
            />
          </div>
        </div>

        <div>
          <Label>Sosyal medya linkleri</Label>
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            {socialFields.map((field) => (
              <div key={field.key}>
                <Label htmlFor={field.key}>{field.label}</Label>
                <Input
                  id={field.key}
                  value={form.socialLinks?.[field.key] ?? ''}
                  onChange={(event) => updateSocial(field.key, event.target.value)}
                  placeholder="https://"
                />
              </div>
            ))}
          </div>
        </div>

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
