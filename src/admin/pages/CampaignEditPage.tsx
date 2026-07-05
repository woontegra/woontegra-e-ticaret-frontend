import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CampaignDto } from '@/shared/types/api';
import { ApiError } from '@/shared/api/client';
import {
  CAMPAIGN_TYPE_LABELS,
  createCampaign,
  findCampaignById,
  updateCampaign,
} from '@/shared/api/promotions.api';
import {
  AdminFormLayout,
  FormSection,
  StickyFormActions,
} from '@/admin/components/ui';
import { useAdminMutationFeedback } from '@/admin/hooks/useAdminMutationFeedback';
import {
  Badge,
  Input,
  Label,
  MediaField,
  Select,
  Textarea,
} from '@/shared/ui';

const emptyForm = {
  name: '',
  type: 'BANNER' as CampaignDto['type'],
  bannerImageId: null as string | null,
  title: '',
  description: '',
  buttonText: '',
  buttonUrl: '',
  startsAt: '',
  endsAt: '',
  isActive: true,
};

export function CampaignEditPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { onSuccess, onError } = useAdminMutationFeedback();

  const [form, setForm] = useState(emptyForm);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const stateCampaign = (location.state as { campaign?: CampaignDto } | null)
    ?.campaign;

  const campaignQuery = useQuery({
    queryKey: ['admin', 'campaigns', id],
    queryFn: () => findCampaignById(id!),
    enabled: !isNew && Boolean(id) && !stateCampaign,
    initialData: stateCampaign,
  });

  useEffect(() => {
    const campaign = campaignQuery.data;
    if (campaign) {
      setForm({
        name: campaign.name,
        type: campaign.type,
        bannerImageId: campaign.bannerImageId,
        title: campaign.title,
        description: campaign.description ?? '',
        buttonText: campaign.buttonText ?? '',
        buttonUrl: campaign.buttonUrl ?? '',
        startsAt: campaign.startsAt?.slice(0, 16) ?? '',
        endsAt: campaign.endsAt?.slice(0, 16) ?? '',
        isActive: campaign.isActive,
      });
    }
  }, [campaignQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        type: form.type,
        bannerImageId: form.bannerImageId,
        title: form.title,
        description: form.description || null,
        buttonText: form.buttonText || null,
        buttonUrl: form.buttonUrl || null,
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
        isActive: form.isActive,
      };
      if (isNew) return createCampaign(payload);
      return updateCampaign(id!, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'campaigns'] });
      onSuccess(isNew ? 'Kampanya oluşturuldu.' : 'Kampanya güncellendi.');
      navigate('/admin/promotions/campaigns');
    },
    onError: (error) => {
      const message =
        error instanceof ApiError ? error.message : 'Kayıt başarısız';
      setErrorMessage(message);
      onError(error, message);
    },
  });

  const previewSidebar = (
    <FormSection title="Önizleme" description="Kampanya vitrin görünümü">
      <div className="overflow-hidden rounded-md border border-[rgb(var(--admin-border))] bg-[rgb(var(--admin-surface-muted))]">
        <div className="aspect-[21/9] bg-slate-200">
          {form.bannerImageId ? (
            <p className="flex h-full items-center justify-center text-xs text-[rgb(var(--admin-text-muted))]">
              Banner seçildi
            </p>
          ) : (
            <p className="flex h-full items-center justify-center text-xs text-[rgb(var(--admin-text-muted))]">
              Banner görseli yok
            </p>
          )}
        </div>
        <div className="space-y-2 p-4">
          <p className="text-sm font-semibold text-[rgb(var(--admin-text))]">
            {form.title || 'Başlık'}
          </p>
          <p className="text-xs text-[rgb(var(--admin-text-muted))]">
            {form.description || 'Açıklama metni burada görünür.'}
          </p>
          {form.buttonText ? (
            <span className="inline-block rounded-md bg-[rgb(var(--admin-primary))] px-3 py-1.5 text-xs font-medium text-white">
              {form.buttonText}
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 pt-1">
        <Badge variant={form.isActive ? 'success' : 'default'}>
          {form.isActive ? 'Aktif' : 'Pasif'}
        </Badge>
        <Badge variant="default">
          {CAMPAIGN_TYPE_LABELS[form.type]}
        </Badge>
      </div>
    </FormSection>
  );

  return (
    <AdminFormLayout
      title={isNew ? 'Yeni Kampanya Oluştur' : 'Kampanya Düzenle'}
      description="Banner, promosyon ve kampanya içeriklerini yönetin"
      backTo="/admin/promotions/campaigns"
      backLabel="Kampanyalar"
      sidebar={previewSidebar}
    >
      <FormSection
        title="Temel Bilgiler"
        description="Kampanya yönetim adı, tip ve yayın durumu"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Yönetim adı</Label>
            <Input
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Örn: Yaz indirimi hero"
            />
            <p className="mt-1 text-xs text-[rgb(var(--admin-text-muted))]">
              Yalnızca panelde görünür; müşteriye gösterilmez.
            </p>
          </div>
          <div>
            <Label>Tip</Label>
            <Select
              value={form.type}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  type: e.target.value as CampaignDto['type'],
                }))
              }
            >
              {Object.entries(CAMPAIGN_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Başlangıç</Label>
            <Input
              type="datetime-local"
              value={form.startsAt}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, startsAt: e.target.value }))
              }
            />
          </div>
          <div>
            <Label>Bitiş</Label>
            <Input
              type="datetime-local"
              value={form.endsAt}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, endsAt: e.target.value }))
              }
            />
          </div>
        </div>
        <label className="flex items-center gap-2.5 rounded-md border border-[rgb(var(--admin-border))] bg-[rgb(var(--admin-surface-muted))] px-3 py-2.5 text-sm">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300"
            checked={form.isActive}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, isActive: e.target.checked }))
            }
          />
          <span className="font-medium text-[rgb(var(--admin-text))]">
            Kampanya aktif
          </span>
        </label>
      </FormSection>

      <FormSection
        title="Görsel ve İçerik"
        description="Vitrinde gösterilecek banner ve metin alanları"
      >
        <MediaField
          label="Banner görseli"
          value={form.bannerImageId}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, bannerImageId: value }))
          }
          folder="campaigns"
        />
        <div>
          <Label>Başlık</Label>
          <Input
            value={form.title}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="Kampanya başlığı"
          />
        </div>
        <div>
          <Label>Açıklama</Label>
          <Textarea
            rows={4}
            value={form.description}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Kısa açıklama metni"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Buton metni</Label>
            <Input
              value={form.buttonText}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, buttonText: e.target.value }))
              }
              placeholder="Örn: Hemen keşfet"
            />
          </div>
          <div>
            <Label>Buton URL</Label>
            <Input
              value={form.buttonUrl}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, buttonUrl: e.target.value }))
              }
              placeholder="https://..."
            />
          </div>
        </div>
      </FormSection>

      {errorMessage ? (
        <p className="text-sm text-red-600">{errorMessage}</p>
      ) : null}

      <StickyFormActions
        onCancel={() => navigate('/admin/promotions/campaigns')}
        onSave={() => saveMutation.mutate()}
        isSaving={saveMutation.isPending}
        saveLabel={isNew ? 'Kampanyayı oluştur' : 'Değişiklikleri kaydet'}
      />
    </AdminFormLayout>
  );
}
