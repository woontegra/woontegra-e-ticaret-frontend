import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ThemeSettingDto } from '@/shared/types/api';
import { getThemeSettings, updateThemeSettings } from '@/shared/api/theme.api';
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

const TABS = [
  { id: 'general', label: 'Genel tema' },
  { id: 'colors', label: 'Renkler' },
  { id: 'typography', label: 'Yazı tipleri' },
  { id: 'buttons', label: 'Butonlar' },
  { id: 'cards', label: 'Kartlar' },
  { id: 'header', label: 'Header' },
  { id: 'product', label: 'Ürün kartı' },
  { id: 'mobile', label: 'Mobil görünüm' },
] as const;

type TabId = (typeof TABS)[number]['id'];

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
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-12 cursor-pointer rounded border border-slate-200"
        />
        <Input value={value} onChange={(event) => onChange(event.target.value)} />
      </div>
    </div>
  );
}

export function ThemeSettingsPage() {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = useAdminMutationFeedback();
  const [tab, setTab] = useState<TabId>('general');
  const [form, setForm] = useState<ThemeSettingDto | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const settingsQuery = useQuery({
    queryKey: ['admin', 'theme-settings'],
    queryFn: getThemeSettings,
  });

  useEffect(() => {
    if (settingsQuery.data) {
      setForm(settingsQuery.data);
    }
  }, [settingsQuery.data]);

  const saveMutation = useMutation({
    mutationFn: updateThemeSettings,
    onSuccess: (data) => {
      setForm(data);
      setErrorMessage(null);
      onSuccess('Tema ayarları kaydedildi.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'theme-settings'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'theme-settings'] });
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
      activeThemeKey: form.activeThemeKey,
      colorPalette: form.colorPalette,
      typography: form.typography,
      layout: form.layout,
      buttonStyle: form.buttonStyle,
      cardStyle: form.cardStyle,
      headerStyle: form.headerStyle,
      productCardStyle: form.productCardStyle,
      borderRadius: form.borderRadius,
      shadowLevel: form.shadowLevel,
      containerWidth: form.containerWidth,
      customCss: form.customCss,
    });
  };

  if (settingsQuery.isLoading || !form) {
    return <p className="text-sm text-slate-500">Yükleniyor…</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card padding="sm">
        <CardHeader
          title="Tema Ayarları"
          description="Public site renk, font ve bileşen stilleri"
        />

        <div className="mb-4 flex flex-wrap gap-1">
          {TABS.map((item) => (
            <Button
              key={item.id}
              type="button"
              size="sm"
              variant={tab === item.id ? 'primary' : 'secondary'}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </div>

        {tab === 'general' ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="theme-key">Aktif tema anahtarı</Label>
              <Input
                id="theme-key"
                value={form.activeThemeKey}
                onChange={(event) =>
                  setForm((prev) =>
                    prev ? { ...prev, activeThemeKey: event.target.value } : prev,
                  )
                }
              />
            </div>
            <div>
              <Label htmlFor="container-width">Container genişliği</Label>
              <Input
                id="container-width"
                value={form.containerWidth}
                onChange={(event) =>
                  setForm((prev) =>
                    prev ? { ...prev, containerWidth: event.target.value } : prev,
                  )
                }
                placeholder="1280px"
              />
            </div>
            <div>
              <Label htmlFor="border-radius">Köşe yuvarlaklığı</Label>
              <Select
                id="border-radius"
                value={form.borderRadius}
                onChange={(event) =>
                  setForm((prev) =>
                    prev ? { ...prev, borderRadius: event.target.value } : prev,
                  )
                }
              >
                <option value="none">Yok</option>
                <option value="sm">Küçük</option>
                <option value="md">Orta</option>
                <option value="lg">Büyük</option>
                <option value="xl">Çok büyük</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="shadow-level">Gölge seviyesi</Label>
              <Select
                id="shadow-level"
                value={form.shadowLevel}
                onChange={(event) =>
                  setForm((prev) =>
                    prev ? { ...prev, shadowLevel: event.target.value } : prev,
                  )
                }
              >
                <option value="none">Yok</option>
                <option value="sm">Küçük</option>
                <option value="md">Orta</option>
                <option value="lg">Büyük</option>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="custom-css">Özel CSS</Label>
              <Textarea
                id="custom-css"
                rows={6}
                value={form.customCss ?? ''}
                onChange={(event) =>
                  setForm((prev) =>
                    prev
                      ? { ...prev, customCss: event.target.value || null }
                      : prev,
                  )
                }
                placeholder=".theme-storefront .my-class { ... }"
              />
            </div>
          </div>
        ) : null}

        {tab === 'colors' ? (
          <div className="grid gap-4 md:grid-cols-2">
            {(
              Object.keys(form.colorPalette) as Array<keyof typeof form.colorPalette>
            ).map((key) => (
              <ColorField
                key={key}
                label={key}
                value={form.colorPalette[key]}
                onChange={(value) =>
                  setForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          colorPalette: { ...prev.colorPalette, [key]: value },
                        }
                      : prev,
                  )
                }
              />
            ))}
          </div>
        ) : null}

        {tab === 'typography' ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Gövde fontu</Label>
              <Input
                value={form.typography.fontFamily}
                onChange={(event) =>
                  setForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          typography: {
                            ...prev.typography,
                            fontFamily: event.target.value,
                          },
                        }
                      : prev,
                  )
                }
              />
            </div>
            <div>
              <Label>Başlık fontu</Label>
              <Input
                value={form.typography.headingFontFamily}
                onChange={(event) =>
                  setForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          typography: {
                            ...prev.typography,
                            headingFontFamily: event.target.value,
                          },
                        }
                      : prev,
                  )
                }
              />
            </div>
            <div>
              <Label>Temel font boyutu (px)</Label>
              <Input
                type="number"
                value={form.typography.baseFontSize}
                onChange={(event) =>
                  setForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          typography: {
                            ...prev.typography,
                            baseFontSize: Number(event.target.value),
                          },
                        }
                      : prev,
                  )
                }
              />
            </div>
            <div>
              <Label>Başlık kalınlığı</Label>
              <Input
                type="number"
                value={form.typography.headingWeight}
                onChange={(event) =>
                  setForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          typography: {
                            ...prev.typography,
                            headingWeight: Number(event.target.value),
                          },
                        }
                      : prev,
                  )
                }
              />
            </div>
            <div>
              <Label>Satır yüksekliği</Label>
              <Input
                type="number"
                step="0.1"
                value={form.typography.lineHeight}
                onChange={(event) =>
                  setForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          typography: {
                            ...prev.typography,
                            lineHeight: Number(event.target.value),
                          },
                        }
                      : prev,
                  )
                }
              />
            </div>
          </div>
        ) : null}

        {tab === 'buttons' ? (
          <div className="grid gap-4 md:grid-cols-2">
            <ColorField
              label="Primary arka plan"
              value={form.buttonStyle.primaryBg}
              onChange={(value) =>
                setForm((prev) =>
                  prev
                    ? {
                        ...prev,
                        buttonStyle: { ...prev.buttonStyle, primaryBg: value },
                      }
                    : prev,
                )
              }
            />
            <ColorField
              label="Primary metin"
              value={form.buttonStyle.primaryText}
              onChange={(value) =>
                setForm((prev) =>
                  prev
                    ? {
                        ...prev,
                        buttonStyle: { ...prev.buttonStyle, primaryText: value },
                      }
                    : prev,
                )
              }
            />
            <ColorField
              label="Primary hover"
              value={form.buttonStyle.primaryHoverBg}
              onChange={(value) =>
                setForm((prev) =>
                  prev
                    ? {
                        ...prev,
                        buttonStyle: {
                          ...prev.buttonStyle,
                          primaryHoverBg: value,
                        },
                      }
                    : prev,
                )
              }
            />
            <div>
              <Label>Köşe yuvarlaklığı</Label>
              <Input
                value={form.buttonStyle.borderRadius}
                onChange={(event) =>
                  setForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          buttonStyle: {
                            ...prev.buttonStyle,
                            borderRadius: event.target.value,
                          },
                        }
                      : prev,
                  )
                }
              />
            </div>
            <div>
              <Label>Yatay padding</Label>
              <Input
                value={form.buttonStyle.paddingX}
                onChange={(event) =>
                  setForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          buttonStyle: {
                            ...prev.buttonStyle,
                            paddingX: event.target.value,
                          },
                        }
                      : prev,
                  )
                }
              />
            </div>
            <div>
              <Label>Dikey padding</Label>
              <Input
                value={form.buttonStyle.paddingY}
                onChange={(event) =>
                  setForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          buttonStyle: {
                            ...prev.buttonStyle,
                            paddingY: event.target.value,
                          },
                        }
                      : prev,
                  )
                }
              />
            </div>
          </div>
        ) : null}

        {tab === 'cards' ? (
          <div className="grid gap-4 md:grid-cols-2">
            <ColorField
              label="Arka plan"
              value={form.cardStyle.background}
              onChange={(value) =>
                setForm((prev) =>
                  prev
                    ? {
                        ...prev,
                        cardStyle: { ...prev.cardStyle, background: value },
                      }
                    : prev,
                )
              }
            />
            <ColorField
              label="Kenarlık"
              value={form.cardStyle.borderColor}
              onChange={(value) =>
                setForm((prev) =>
                  prev
                    ? {
                        ...prev,
                        cardStyle: { ...prev.cardStyle, borderColor: value },
                      }
                    : prev,
                )
              }
            />
            <div>
              <Label>Köşe yuvarlaklığı</Label>
              <Input
                value={form.cardStyle.borderRadius}
                onChange={(event) =>
                  setForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          cardStyle: {
                            ...prev.cardStyle,
                            borderRadius: event.target.value,
                          },
                        }
                      : prev,
                  )
                }
              />
            </div>
            <div>
              <Label>Gölge</Label>
              <Select
                value={form.cardStyle.shadow}
                onChange={(event) =>
                  setForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          cardStyle: {
                            ...prev.cardStyle,
                            shadow: event.target.value,
                          },
                        }
                      : prev,
                  )
                }
              >
                <option value="none">Yok</option>
                <option value="sm">Küçük</option>
                <option value="md">Orta</option>
                <option value="lg">Büyük</option>
              </Select>
            </div>
            <div>
              <Label>Padding</Label>
              <Input
                value={form.cardStyle.padding}
                onChange={(event) =>
                  setForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          cardStyle: {
                            ...prev.cardStyle,
                            padding: event.target.value,
                          },
                        }
                      : prev,
                  )
                }
              />
            </div>
          </div>
        ) : null}

        {tab === 'header' ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              Yapısal header ayarları (sticky, yükseklik, menü pozisyonu) için{' '}
              <a
                href="/admin/theme/header"
                className="font-medium text-slate-700 underline-offset-2 hover:underline"
              >
                Header Ayarları
              </a>{' '}
              sayfasını kullanın. Burada yalnızca renkler düzenlenir.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
            <ColorField
              label="Arka plan"
              value={form.headerStyle.background}
              onChange={(value) =>
                setForm((prev) =>
                  prev
                    ? {
                        ...prev,
                        headerStyle: { ...prev.headerStyle, background: value },
                      }
                    : prev,
                )
              }
            />
            <ColorField
              label="Link rengi"
              value={form.headerStyle.textColor}
              onChange={(value) =>
                setForm((prev) =>
                  prev
                    ? {
                        ...prev,
                        headerStyle: { ...prev.headerStyle, textColor: value },
                      }
                    : prev,
                )
              }
            />
            <ColorField
              label="Link hover"
              value={form.headerStyle.textHoverColor}
              onChange={(value) =>
                setForm((prev) =>
                  prev
                    ? {
                        ...prev,
                        headerStyle: {
                          ...prev.headerStyle,
                          textHoverColor: value,
                        },
                      }
                    : prev,
                )
              }
            />
            <ColorField
              label="Kenarlık"
              value={form.headerStyle.borderColor}
              onChange={(value) =>
                setForm((prev) =>
                  prev
                    ? {
                        ...prev,
                        headerStyle: { ...prev.headerStyle, borderColor: value },
                      }
                    : prev,
                )
              }
            />
            </div>
          </div>
        ) : null}

        {tab === 'product' ? (
          <div className="grid gap-4 md:grid-cols-2">
            <ColorField
              label="Fiyat rengi"
              value={form.productCardStyle.priceColor}
              onChange={(value) =>
                setForm((prev) =>
                  prev
                    ? {
                        ...prev,
                        productCardStyle: {
                          ...prev.productCardStyle,
                          priceColor: value,
                        },
                      }
                    : prev,
                )
              }
            />
            <div>
              <Label>Köşe yuvarlaklığı</Label>
              <Input
                value={form.productCardStyle.borderRadius}
                onChange={(event) =>
                  setForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          productCardStyle: {
                            ...prev.productCardStyle,
                            borderRadius: event.target.value,
                          },
                        }
                      : prev,
                  )
                }
              />
            </div>
            <div>
              <Label>Görsel oranı</Label>
              <Input
                value={form.productCardStyle.imageRatio}
                onChange={(event) =>
                  setForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          productCardStyle: {
                            ...prev.productCardStyle,
                            imageRatio: event.target.value,
                          },
                        }
                      : prev,
                  )
                }
                placeholder="1/1"
              />
            </div>
            <div>
              <Label>Başlık boyutu</Label>
              <Input
                value={form.productCardStyle.titleSize}
                onChange={(event) =>
                  setForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          productCardStyle: {
                            ...prev.productCardStyle,
                            titleSize: event.target.value,
                          },
                        }
                      : prev,
                  )
                }
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.productCardStyle.showBadge}
                onChange={(event) =>
                  setForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          productCardStyle: {
                            ...prev.productCardStyle,
                            showBadge: event.target.checked,
                          },
                        }
                      : prev,
                  )
                }
                className="rounded border-slate-300"
              />
              Rozet göster
            </label>
          </div>
        ) : null}

        {tab === 'mobile' ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Mobil yatay padding</Label>
              <Input
                value={form.layout.mobilePadding}
                onChange={(event) =>
                  setForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          layout: {
                            ...prev.layout,
                            mobilePadding: event.target.value,
                          },
                        }
                      : prev,
                  )
                }
              />
            </div>
            <div>
              <Label>Bölüm aralığı</Label>
              <Input
                value={form.layout.sectionSpacing}
                onChange={(event) =>
                  setForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          layout: {
                            ...prev.layout,
                            sectionSpacing: event.target.value,
                          },
                        }
                      : prev,
                  )
                }
              />
            </div>
            <div>
              <Label>Mobil font boyutu (px)</Label>
              <Input
                type="number"
                value={form.layout.mobileFontSize}
                onChange={(event) =>
                  setForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          layout: {
                            ...prev.layout,
                            mobileFontSize: Number(event.target.value),
                          },
                        }
                      : prev,
                  )
                }
              />
            </div>
            <div>
              <Label>Mobil header yüksekliği</Label>
              <Input
                value={form.layout.mobileHeaderHeight}
                onChange={(event) =>
                  setForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          layout: {
                            ...prev.layout,
                            mobileHeaderHeight: event.target.value,
                          },
                        }
                      : prev,
                  )
                }
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.layout.compactNav}
                onChange={(event) =>
                  setForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          layout: {
                            ...prev.layout,
                            compactNav: event.target.checked,
                          },
                        }
                      : prev,
                  )
                }
                className="rounded border-slate-300"
              />
              Kompakt mobil menü
            </label>
          </div>
        ) : null}

        <div className="mt-4 flex items-center gap-3">
          <Button type="submit" isLoading={saveMutation.isPending}>
            Kaydet
          </Button>
          {errorMessage ? (
            <p className="text-sm text-red-600">{errorMessage}</p>
          ) : null}
        </div>
      </Card>
    </form>
  );
}
