import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { CampaignDto } from '@/shared/types/api';
import { ApiError } from '@/shared/api/client';
import {
  CAMPAIGN_TYPE_LABELS,
  createCampaign,
  deleteCampaign,
  listCampaigns,
  updateCampaign,
} from '@/shared/api/promotions.api';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Input,
  Label,
  MediaField,
  Modal,
  Select,
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeaderCell,
  TableRow,
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

export function CampaignsPage() {
  const queryClient = useQueryClient();
  const formModal = useDisclosure();
  const [selected, setSelected] = useState<CampaignDto | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const campaignsQuery = useQuery({
    queryKey: ['admin', 'campaigns'],
    queryFn: listCampaigns,
  });

  useEffect(() => {
    if (selected) {
      setForm({
        name: selected.name,
        type: selected.type,
        bannerImageId: selected.bannerImageId,
        title: selected.title,
        description: selected.description ?? '',
        buttonText: selected.buttonText ?? '',
        buttonUrl: selected.buttonUrl ?? '',
        startsAt: selected.startsAt?.slice(0, 16) ?? '',
        endsAt: selected.endsAt?.slice(0, 16) ?? '',
        isActive: selected.isActive,
      });
    } else {
      setForm(emptyForm);
    }
  }, [selected, formModal.isOpen]);

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
      if (selected) return updateCampaign(selected.id, payload);
      return createCampaign(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'campaigns'] });
      formModal.close();
      setSelected(null);
      setErrorMessage(null);
    },
    onError: (error) => {
      setErrorMessage(error instanceof ApiError ? error.message : 'Kayıt başarısız');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'campaigns'] });
    },
  });

  return (
    <>
      <Card padding="sm">
        <CardHeader
          title="Kampanyalar"
          description="Banner ve promosyon içerikleri — builder'da seçilebilir"
          action={
            <Button
              size="sm"
              onClick={() => {
                setSelected(null);
                formModal.open();
              }}
            >
              <Plus className="mr-1 h-4 w-4" />
              Yeni kampanya
            </Button>
          }
        />

        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Ad</TableHeaderCell>
              <TableHeaderCell>Tip</TableHeaderCell>
              <TableHeaderCell>Başlık</TableHeaderCell>
              <TableHeaderCell>Durum</TableHeaderCell>
              <TableHeaderCell className="text-right">İşlem</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {campaignsQuery.isLoading ? (
              <TableEmpty colSpan={5} message="Yükleniyor…" />
            ) : (campaignsQuery.data?.length ?? 0) === 0 ? (
              <TableEmpty colSpan={5} message="Henüz kampanya yok." />
            ) : (
              campaignsQuery.data!.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>{campaign.name}</TableCell>
                  <TableCell>{CAMPAIGN_TYPE_LABELS[campaign.type]}</TableCell>
                  <TableCell>{campaign.title}</TableCell>
                  <TableCell>
                    <Badge variant={campaign.isActive ? 'success' : 'default'}>
                      {campaign.isActive ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelected(campaign);
                          formModal.open();
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (window.confirm('Kampanya silinsin mi?')) {
                            deleteMutation.mutate(campaign.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
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
        isOpen={formModal.isOpen}
        onClose={formModal.close}
        title={selected ? 'Kampanya düzenle' : 'Yeni kampanya'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Yönetim adı</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
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
            />
          </div>
          <div>
            <Label>Açıklama</Label>
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
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
              />
            </div>
            <div>
              <Label>Buton URL</Label>
              <Input
                value={form.buttonUrl}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, buttonUrl: e.target.value }))
                }
              />
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
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, isActive: e.target.checked }))
              }
            />
            Aktif
          </label>
        </div>
        {errorMessage ? (
          <p className="mt-3 text-sm text-red-600">{errorMessage}</p>
        ) : null}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={formModal.close}>
            İptal
          </Button>
          <Button
            disabled={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            Kaydet
          </Button>
        </div>
      </Modal>
    </>
  );
}
