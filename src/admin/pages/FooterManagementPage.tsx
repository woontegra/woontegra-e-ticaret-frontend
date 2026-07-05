import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowDown,
  ArrowUp,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import type {
  FooterColumnDto,
  FooterLinkDto,
  FooterSettingDto,
  SocialLinks,
} from '@/shared/types/api';
import { ApiError } from '@/shared/api/client';
import {
  createFooterColumn,
  createFooterLink,
  deleteFooterColumn,
  deleteFooterLink,
  getFooterSettings,
  listFooterColumnsWithLinks,
  updateFooterColumn,
  updateFooterLink,
  updateFooterSettings,
} from '@/shared/api/footer.api';
import {
  FooterLinkFormModal,
  type FooterLinkFormValues,
} from '@/admin/components/FooterLinkFormModal';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Input,
  Label,
  MediaField,
  MediaMultiField,
  Modal,
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

export function FooterManagementPage() {
  const queryClient = useQueryClient();
  const [settingsForm, setSettingsForm] = useState<Partial<FooterSettingDto>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [columnTitle, setColumnTitle] = useState('');
  const [editingColumn, setEditingColumn] = useState<FooterColumnDto | null>(null);
  const [columnToDelete, setColumnToDelete] = useState<FooterColumnDto | null>(null);

  const [linkColumnId, setLinkColumnId] = useState<string | null>(null);
  const [selectedLink, setSelectedLink] = useState<FooterLinkDto | null>(null);
  const [linkToDelete, setLinkToDelete] = useState<FooterLinkDto | null>(null);

  const columnModal = useDisclosure();
  const columnDeleteModal = useDisclosure();
  const linkModal = useDisclosure();
  const linkDeleteModal = useDisclosure();

  const settingsQuery = useQuery({
    queryKey: ['admin', 'footer-settings'],
    queryFn: getFooterSettings,
  });

  const columnsQuery = useQuery({
    queryKey: ['admin', 'footer-columns'],
    queryFn: listFooterColumnsWithLinks,
  });

  useEffect(() => {
    if (settingsQuery.data) {
      setSettingsForm(settingsQuery.data);
    }
  }, [settingsQuery.data]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'footer-settings'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'footer-columns'] });
    queryClient.invalidateQueries({ queryKey: ['public', 'footer'] });
  };

  const saveSettingsMutation = useMutation({
    mutationFn: updateFooterSettings,
    onSuccess: (data) => {
      setSettingsForm(data);
      setMessage('Footer ayarları kaydedildi.');
      setErrorMessage(null);
      invalidate();
    },
    onError: (error) => {
      setMessage(null);
      setErrorMessage(
        error instanceof ApiError ? error.message : 'Kayıt başarısız',
      );
    },
  });

  const saveColumnMutation = useMutation({
    mutationFn: () => {
      if (editingColumn) {
        return updateFooterColumn(editingColumn.id, { title: columnTitle });
      }
      return createFooterColumn({ title: columnTitle });
    },
    onSuccess: () => {
      invalidate();
      columnModal.close();
      setEditingColumn(null);
      setColumnTitle('');
    },
  });

  const deleteColumnMutation = useMutation({
    mutationFn: () => deleteFooterColumn(columnToDelete!.id),
    onSuccess: () => {
      invalidate();
      columnDeleteModal.close();
      setColumnToDelete(null);
    },
  });

  const saveLinkMutation = useMutation({
    mutationFn: (values: FooterLinkFormValues) => {
      const payload = {
        label: values.label,
        type: values.type,
        targetId: values.targetId || null,
        url: values.type === 'CUSTOM_URL' ? values.url : null,
        openInNewTab: values.openInNewTab,
        isActive: values.isActive,
      };

      if (selectedLink) {
        return updateFooterLink(selectedLink.id, payload);
      }

      return createFooterLink(linkColumnId!, {
        ...payload,
        label: values.label,
        type: values.type,
      });
    },
    onSuccess: () => {
      invalidate();
      linkModal.close();
      setSelectedLink(null);
      setLinkColumnId(null);
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: () => deleteFooterLink(linkToDelete!.id),
    onSuccess: () => {
      invalidate();
      linkDeleteModal.close();
      setLinkToDelete(null);
    },
  });

  const toggleColumnMutation = useMutation({
    mutationFn: (column: FooterColumnDto) =>
      updateFooterColumn(column.id, { isActive: !column.isActive }),
    onSuccess: invalidate,
  });

  const reorderColumnMutation = useMutation({
    mutationFn: async (columns: FooterColumnDto[]) => {
      await Promise.all(
        columns.map((column, index) =>
          updateFooterColumn(column.id, { sortOrder: index }),
        ),
      );
    },
    onSuccess: invalidate,
  });

  const reorderLinkMutation = useMutation({
    mutationFn: async ({
      columnId,
      links,
    }: {
      columnId: string;
      links: FooterLinkDto[];
    }) => {
      await Promise.all(
        links.map((link, index) =>
          updateFooterLink(link.id, { sortOrder: index }),
        ),
      );
      return columnId;
    },
    onSuccess: invalidate,
  });

  const updateSocial = (key: keyof SocialLinks, value: string) => {
    setSettingsForm((prev) => ({
      ...prev,
      socialLinks: {
        ...(prev.socialLinks ?? {}),
        [key]: value,
      },
    }));
  };

  const handleSettingsSubmit = (event: FormEvent) => {
    event.preventDefault();
    saveSettingsMutation.mutate({
      logoMediaId: settingsForm.logoMediaId ?? null,
      description: settingsForm.description ?? null,
      phone: settingsForm.phone ?? null,
      email: settingsForm.email ?? null,
      address: settingsForm.address ?? null,
      showNewsletter: settingsForm.showNewsletter ?? false,
      copyrightText: settingsForm.copyrightText ?? null,
      socialLinks: settingsForm.socialLinks,
      paymentIconIds: settingsForm.paymentIconIds ?? [],
      shippingIconIds: settingsForm.shippingIconIds ?? [],
    });
  };

  const openCreateColumn = () => {
    setEditingColumn(null);
    setColumnTitle('');
    columnModal.open();
  };

  const openEditColumn = (column: FooterColumnDto) => {
    setEditingColumn(column);
    setColumnTitle(column.title);
    columnModal.open();
  };

  const openCreateLink = (columnId: string) => {
    setSelectedLink(null);
    setLinkColumnId(columnId);
    linkModal.open();
  };

  const openEditLink = (link: FooterLinkDto) => {
    setSelectedLink(link);
    setLinkColumnId(link.columnId);
    linkModal.open();
  };

  const moveColumn = (column: FooterColumnDto, direction: 'up' | 'down') => {
    const columns = structuredClone(columnsQuery.data ?? []);
    const index = columns.findIndex((item) => item.id === column.id);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= columns.length) return;

    [columns[index], columns[targetIndex]] = [
      columns[targetIndex],
      columns[index],
    ];

    reorderColumnMutation.mutate(columns);
  };

  const moveLink = (
    column: FooterColumnDto,
    link: FooterLinkDto,
    direction: 'up' | 'down',
  ) => {
    const links = structuredClone(column.links ?? []);
    const index = links.findIndex((item) => item.id === link.id);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= links.length) return;

    [links[index], links[targetIndex]] = [links[targetIndex], links[index]];

    reorderLinkMutation.mutate({ columnId: column.id, links });
  };

  if (settingsQuery.isLoading || columnsQuery.isLoading) {
    return <p className="text-sm text-slate-500">Yükleniyor…</p>;
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSettingsSubmit}>
        <Card padding="sm">
          <CardHeader
            title="Footer genel bilgiler"
            description="Logo, iletişim bilgileri ve alt metin"
          />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <MediaField
                label="Footer logosu"
                value={settingsForm.logoMediaId ?? null}
                onChange={(value) =>
                  setSettingsForm((prev) => ({ ...prev, logoMediaId: value }))
                }
                folder="branding"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="footer-description">Açıklama</Label>
              <Textarea
                id="footer-description"
                rows={3}
                value={settingsForm.description ?? ''}
                onChange={(event) =>
                  setSettingsForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
              />
            </div>

            <div>
              <Label htmlFor="footer-phone">Telefon</Label>
              <Input
                id="footer-phone"
                value={settingsForm.phone ?? ''}
                onChange={(event) =>
                  setSettingsForm((prev) => ({ ...prev, phone: event.target.value }))
                }
              />
            </div>

            <div>
              <Label htmlFor="footer-email">E-posta</Label>
              <Input
                id="footer-email"
                type="email"
                value={settingsForm.email ?? ''}
                onChange={(event) =>
                  setSettingsForm((prev) => ({ ...prev, email: event.target.value }))
                }
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="footer-address">Adres</Label>
              <Textarea
                id="footer-address"
                rows={2}
                value={settingsForm.address ?? ''}
                onChange={(event) =>
                  setSettingsForm((prev) => ({
                    ...prev,
                    address: event.target.value,
                  }))
                }
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="footer-copyright">Telif metni</Label>
              <Input
                id="footer-copyright"
                value={settingsForm.copyrightText ?? ''}
                onChange={(event) =>
                  setSettingsForm((prev) => ({
                    ...prev,
                    copyrightText: event.target.value,
                  }))
                }
                placeholder="© 2026 Mağaza Adı. Tüm hakları saklıdır."
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={settingsForm.showNewsletter ?? false}
                  onChange={(event) =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      showNewsletter: event.target.checked,
                    }))
                  }
                  className="rounded border-slate-300"
                />
                Bülten formunu göster
              </label>
            </div>
          </div>
        </Card>

        <Card padding="sm" className="mt-4">
          <CardHeader title="Sosyal medya linkleri" />
          <div className="grid gap-3 md:grid-cols-2">
            {socialFields.map((field) => (
              <div key={field.key}>
                <Label htmlFor={`social-${field.key}`}>{field.label}</Label>
                <Input
                  id={`social-${field.key}`}
                  value={settingsForm.socialLinks?.[field.key] ?? ''}
                  onChange={(event) => updateSocial(field.key, event.target.value)}
                  placeholder="https://"
                />
              </div>
            ))}
          </div>
        </Card>

        <Card padding="sm" className="mt-4">
          <CardHeader title="Ödeme ve kargo ikonları" />
          <div className="grid gap-4 md:grid-cols-2">
            <MediaMultiField
              label="Ödeme ikonları"
              value={settingsForm.paymentIconIds ?? []}
              onChange={(value) =>
                setSettingsForm((prev) => ({ ...prev, paymentIconIds: value }))
              }
              folder="payment"
              description="Visa, Mastercard vb. ikonları medya kütüphanesinden seçin"
            />
            <MediaMultiField
              label="Kargo ikonları"
              value={settingsForm.shippingIconIds ?? []}
              onChange={(value) =>
                setSettingsForm((prev) => ({ ...prev, shippingIconIds: value }))
              }
              folder="shipping"
              description="Kargo firması ikonlarını seçin"
            />
          </div>
        </Card>

        <div className="mt-4 flex items-center gap-3">
          <Button type="submit" isLoading={saveSettingsMutation.isPending}>
            Footer ayarlarını kaydet
          </Button>
          {message ? <p className="text-sm text-green-600">{message}</p> : null}
          {errorMessage ? (
            <p className="text-sm text-red-600">{errorMessage}</p>
          ) : null}
        </div>
      </form>

      <Card padding="sm">
        <CardHeader
          title="Footer kolonları"
          description="Kolon başlıkları ve linkleri"
          action={
            <Button size="sm" onClick={openCreateColumn}>
              <Plus className="h-4 w-4" />
              Kolon ekle
            </Button>
          }
        />

        {(columnsQuery.data ?? []).length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
            Henüz kolon yok.
          </p>
        ) : (
          <div className="space-y-4">
            {(columnsQuery.data ?? []).map((column) => (
              <div
                key={column.id}
                className="rounded-lg border border-slate-200 p-3"
              >
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900">
                    {column.title}
                  </p>
                  <Badge variant={column.isActive ? 'success' : 'default'}>
                    {column.isActive ? 'Aktif' : 'Pasif'}
                  </Badge>
                  <div className="ml-auto flex flex-wrap gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveColumn(column, 'up')}
                      disabled={reorderColumnMutation.isPending}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveColumn(column, 'down')}
                      disabled={reorderColumnMutation.isPending}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleColumnMutation.mutate(column)}
                    >
                      {column.isActive ? 'Pasifleştir' : 'Aktifleştir'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditColumn(column)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setColumnToDelete(column);
                        columnDeleteModal.open();
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                    <Button size="sm" onClick={() => openCreateLink(column.id)}>
                      Link ekle
                    </Button>
                  </div>
                </div>

                {(column.links ?? []).length === 0 ? (
                  <p className="text-xs text-slate-500">Bu kolonda link yok.</p>
                ) : (
                  <ul className="divide-y divide-slate-100 rounded-md border border-slate-100">
                    {(column.links ?? []).map((link) => (
                      <li
                        key={link.id}
                        className="flex flex-wrap items-center gap-2 px-3 py-2"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-slate-900">{link.label}</p>
                          <p className="text-xs text-slate-500">
                            {link.href ?? '—'} {!link.isActive ? '· pasif' : ''}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveLink(column, link, 'up')}
                            disabled={reorderLinkMutation.isPending}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveLink(column, link, 'down')}
                            disabled={reorderLinkMutation.isPending}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditLink(link)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setLinkToDelete(link);
                              linkDeleteModal.open();
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        isOpen={columnModal.isOpen}
        onClose={columnModal.close}
        title={editingColumn ? 'Kolon düzenle' : 'Kolon ekle'}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={columnModal.close}>
              İptal
            </Button>
            <Button
              isLoading={saveColumnMutation.isPending}
              disabled={!columnTitle.trim()}
              onClick={() => saveColumnMutation.mutate()}
            >
              Kaydet
            </Button>
          </>
        }
      >
        <Label htmlFor="column-title" required>
          Kolon başlığı
        </Label>
        <Input
          id="column-title"
          value={columnTitle}
          onChange={(event) => setColumnTitle(event.target.value)}
        />
      </Modal>

      <Modal
        isOpen={columnDeleteModal.isOpen}
        onClose={columnDeleteModal.close}
        title="Kolonu sil"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={columnDeleteModal.close}>
              İptal
            </Button>
            <Button
              variant="danger"
              isLoading={deleteColumnMutation.isPending}
              onClick={() => deleteColumnMutation.mutate()}
            >
              Sil
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          <strong>{columnToDelete?.title}</strong> ve tüm linkleri silinecek.
        </p>
      </Modal>

      <FooterLinkFormModal
        isOpen={linkModal.isOpen}
        onClose={linkModal.close}
        title={selectedLink ? 'Link düzenle' : 'Link ekle'}
        initial={selectedLink}
        isLoading={saveLinkMutation.isPending}
        onSubmit={(values) => saveLinkMutation.mutate(values)}
      />

      <Modal
        isOpen={linkDeleteModal.isOpen}
        onClose={linkDeleteModal.close}
        title="Linki sil"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={linkDeleteModal.close}>
              İptal
            </Button>
            <Button
              variant="danger"
              isLoading={deleteLinkMutation.isPending}
              onClick={() => deleteLinkMutation.mutate()}
            >
              Sil
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          <strong>{linkToDelete?.label}</strong> silinecek.
        </p>
      </Modal>
    </div>
  );
}
