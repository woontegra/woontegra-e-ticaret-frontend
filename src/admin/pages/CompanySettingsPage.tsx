import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CompanySettingDto, ContactLabels, SocialLinks } from '@/shared/types/api';
import {
  getAdminCompanySettings,
  updateAdminCompanySettings,
} from '@/shared/api/settings.api';
import { useAdminMutationFeedback } from '@/admin/hooks/useAdminMutationFeedback';
import {
  Button,
  Card,
  Input,
  Label,
  Textarea,
} from '@/shared/ui';

const contactLabelFields: Array<{ key: keyof ContactLabels; label: string }> = [
  { key: 'company', label: 'Firma etiketi' },
  { key: 'phone', label: 'Telefon etiketi' },
  { key: 'email', label: 'E-posta etiketi' },
  { key: 'support', label: 'Destek etiketi' },
  { key: 'workingHours', label: 'Çalışma saatleri etiketi' },
];

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
  const { onSuccess, onError } = useAdminMutationFeedback();
  const [form, setForm] = useState<Partial<CompanySettingDto>>({});
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
      setErrorMessage(null);
      onSuccess('Firma bilgileri kaydedildi.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'company-settings'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'company-settings'] });
    },
    onError: (error) => {
      const message = onError(error, 'Kayıt başarısız');
      setErrorMessage(message);
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

  const updateContactLabel = (key: keyof ContactLabels, value: string) => {
    setForm((prev) => ({
      ...prev,
      contactLabels: {
        ...(prev.contactLabels ?? {}),
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
      contactFormKey: form.contactFormKey ?? null,
      contactLabels: form.contactLabels,
      currency: form.currency,
      defaultTaxRate: form.defaultTaxRate,
      socialLinks: form.socialLinks,
    });
  };

  if (settingsQuery.isLoading) {
    return <p className="text-sm text-slate-500">Yükleniyor…</p>;
  }

  if (settingsQuery.isError) {
    return (
      <p className="text-sm text-red-600">Firma ayarları yüklenemedi.</p>
    );
  }

  return (
    <Card padding="sm">
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

        <div className="space-y-3 border-t border-slate-100 pt-4">
          <h2 className="text-sm font-semibold text-slate-900">İletişim sayfası</h2>
          <div>
            <Label htmlFor="contactFormKey">İletişim form anahtarı</Label>
            <Input
              id="contactFormKey"
              value={form.contactFormKey ?? ''}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  contactFormKey: event.target.value || null,
                }))
              }
              placeholder="CONTACT_FORM"
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {contactLabelFields.map((field) => (
              <div key={field.key}>
                <Label htmlFor={`contact-label-${field.key}`}>{field.label}</Label>
                <Input
                  id={`contact-label-${field.key}`}
                  value={form.contactLabels?.[field.key] ?? ''}
                  onChange={(event) =>
                    updateContactLabel(field.key, event.target.value)
                  }
                />
              </div>
            ))}
          </div>
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
