import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMedia, isImageMedia } from '@/shared/api/media.api';
import { listCampaigns } from '@/shared/api/promotions.api';
import { PAGE_BLOCK_TYPE_LABELS } from '@/shared/api/layouts.api';
import {
  parseBlockContent,
  parseBlockSettings,
} from '@/shared/lib/block-model';
import type { PageBlockDto, PageBlockType } from '@/shared/types/api';
import {
  Input,
  Label,
  MediaField,
  Select,
  Textarea,
} from '@/shared/ui';
import { BlockItemEditors } from '@/admin/components/builder/BlockItemEditors';

interface BlockSettingsPanelProps {
  block: PageBlockDto | null;
  onChange: (block: PageBlockDto) => void;
}

function hasGridSettings(type: PageBlockType): boolean {
  return (
    type === 'PRODUCT_GRID' ||
    type === 'PRODUCT_CAROUSEL' ||
    type === 'CATEGORY_GRID' ||
    type === 'BLOG_GRID'
  );
}

function hasCtaFields(type: PageBlockType): boolean {
  return type === 'HERO' || type === 'HERO_SLIDER';
}

function hasBodyField(type: PageBlockType): boolean {
  return type === 'TEXT' || type === 'TEXT_IMAGE';
}

function hasBannerLink(type: PageBlockType): boolean {
  return type === 'IMAGE_BANNER';
}

function hasSpacerHeight(type: PageBlockType): boolean {
  return type === 'CUSTOM_SPACER';
}

function hasImageField(type: PageBlockType): boolean {
  return (
    type === 'HERO' ||
    type === 'HERO_SLIDER' ||
    type === 'TEXT_IMAGE' ||
    type === 'IMAGE_BANNER'
  );
}

export function BlockSettingsPanel({ block, onChange }: BlockSettingsPanelProps) {
  const updateContent = useCallback(
    (patch: Record<string, unknown>) => {
      if (!block) return;
      onChange({
        ...block,
        content: { ...block.content, ...patch },
      });
    },
    [block, onChange],
  );

  const updateSettings = useCallback(
    (patch: Record<string, unknown>) => {
      if (!block) return;
      onChange({
        ...block,
        settings: { ...block.settings, ...patch },
      });
    },
    [block, onChange],
  );

  const handleTitleChange = (title: string) => {
    if (!block) return;
    onChange({
      ...block,
      title,
      content: { ...block.content, headline: title },
    });
  };

  const handleMediaChange = async (mediaId: string | null) => {
    if (!block) return;

    let imageUrl: string | undefined;
    if (mediaId) {
      try {
        const media = await getMedia(mediaId);
        if (isImageMedia(media)) {
          imageUrl = media.url;
        }
      } catch {
        imageUrl = undefined;
      }
    }

    onChange({
      ...block,
      content: {
        ...block.content,
        imageMediaId: mediaId,
        ...(mediaId ? { imageUrl } : { imageUrl: undefined }),
      },
    });
  };

  if (!block) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center">
        <p className="text-sm text-slate-500">
          Düzenlemek için soldan bir blok seçin.
        </p>
      </div>
    );
  }

  const content = parseBlockContent(block.content);
  const settings = parseBlockSettings(block.settings);
  const title = block.title ?? content.headline ?? '';

  const campaignsQuery = useQuery({
    queryKey: ['admin', 'campaigns', 'options'],
    queryFn: () => listCampaigns({ limit: 200 }),
    select: (data) => data.items,
    enabled: block.type === 'CAMPAIGN',
  });

  return (
    <div className="space-y-6 p-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Blok tipi
        </p>
        <p className="mt-1 text-sm font-medium text-slate-800">
          {PAGE_BLOCK_TYPE_LABELS[block.type]}
        </p>
      </div>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          İçerik
        </h3>

        <div>
          <Label htmlFor="block-title">Başlık</Label>
          <Input
            id="block-title"
            value={title}
            onChange={(event) => handleTitleChange(event.target.value)}
            placeholder="Blok başlığı"
          />
        </div>

        <div>
          <Label htmlFor="block-subheadline">Alt başlık</Label>
          <Input
            id="block-subheadline"
            value={content.subheadline ?? ''}
            onChange={(event) =>
              updateContent({ subheadline: event.target.value })
            }
            placeholder="Alt başlık"
          />
        </div>

        <div>
          <Label htmlFor="block-description">Açıklama</Label>
          <Textarea
            id="block-description"
            rows={3}
            value={content.description ?? ''}
            onChange={(event) =>
              updateContent({ description: event.target.value })
            }
            placeholder="Kısa açıklama"
          />
        </div>

        {hasBodyField(block.type) ? (
          <div>
            <Label htmlFor="block-body">Metin içeriği</Label>
            <Textarea
              id="block-body"
              rows={5}
              value={content.body ?? ''}
              onChange={(event) => updateContent({ body: event.target.value })}
              placeholder="Ana metin"
            />
          </div>
        ) : null}

        {hasImageField(block.type) ? (
          <MediaField
            label="Görsel"
            value={content.imageMediaId ?? null}
            onChange={handleMediaChange}
            folder="homepage"
          />
        ) : null}

        {hasCtaFields(block.type) ? (
          <>
            <div>
              <Label htmlFor="block-cta-label">Buton metni</Label>
              <Input
                id="block-cta-label"
                value={content.ctaLabel ?? ''}
                onChange={(event) =>
                  updateContent({ ctaLabel: event.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="block-cta-url">Buton linki</Label>
              <Input
                id="block-cta-url"
                value={content.ctaUrl ?? ''}
                onChange={(event) =>
                  updateContent({ ctaUrl: event.target.value })
                }
                placeholder="/products"
              />
            </div>
          </>
        ) : null}

        {hasBannerLink(block.type) ? (
          <div>
            <Label htmlFor="block-link-url">Banner linki</Label>
            <Input
              id="block-link-url"
              value={content.linkUrl ?? ''}
              onChange={(event) =>
                updateContent({ linkUrl: event.target.value })
              }
              placeholder="/kampanya"
            />
          </div>
        ) : null}

        {hasGridSettings(block.type) ? (
          <>
            <div>
              <Label htmlFor="block-item-count">Gösterilecek adet</Label>
              <Input
                id="block-item-count"
                type="number"
                min={1}
                max={24}
                value={settings.itemCount ?? ''}
                onChange={(event) =>
                  updateSettings({
                    itemCount: event.target.value
                      ? Number(event.target.value)
                      : undefined,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="block-columns">Sütun sayısı</Label>
              <Input
                id="block-columns"
                type="number"
                min={1}
                max={6}
                value={settings.columns ?? ''}
                onChange={(event) =>
                  updateSettings({
                    columns: event.target.value
                      ? Number(event.target.value)
                      : undefined,
                  })
                }
              />
            </div>
          </>
        ) : null}

        {hasSpacerHeight(block.type) ? (
          <div>
            <Label htmlFor="block-spacer-height">Boşluk yüksekliği</Label>
            <Input
              id="block-spacer-height"
              value={settings.height ?? ''}
              onChange={(event) =>
                updateSettings({ height: event.target.value })
              }
              placeholder="2rem"
            />
          </div>
        ) : null}

        {block.type === 'CAMPAIGN' ? (
          <div>
            <Label htmlFor="block-campaign-id">Kampanya</Label>
            <Select
              id="block-campaign-id"
              value={content.campaignId ?? ''}
              onChange={(event) =>
                updateContent({ campaignId: event.target.value })
              }
            >
              <option value="">Kampanya seçin…</option>
              {(campaignsQuery.data ?? []).map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name} ({campaign.title})
                </option>
              ))}
            </Select>
            <p className="mt-1 text-xs text-slate-500">
              İçerik ve görsel admin → Kampanyalar bölümünden yönetilir.
            </p>
          </div>
        ) : null}

        {block.type === 'CONTACT_FORM' ? (
          <div>
            <Label htmlFor="block-form-key">Form anahtarı</Label>
            <Input
              id="block-form-key"
              value={content.formKey ?? ''}
              onChange={(event) =>
                updateContent({ formKey: event.target.value })
              }
              placeholder="CONTACT_FORM"
            />
            <p className="mt-1 text-xs text-slate-500">
              Admin → İletişim → Formlar bölümündeki form anahtarını girin.
            </p>
          </div>
        ) : null}

        {block.type === 'NEWSLETTER' ? (
          <div className="space-y-3">
            <div>
              <Label htmlFor="block-newsletter-placeholder">E-posta placeholder</Label>
              <Input
                id="block-newsletter-placeholder"
                value={content.emailPlaceholder ?? ''}
                onChange={(event) =>
                  updateContent({ emailPlaceholder: event.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="block-newsletter-button">Buton metni</Label>
              <Input
                id="block-newsletter-button"
                value={content.buttonLabel ?? ''}
                onChange={(event) =>
                  updateContent({ buttonLabel: event.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="block-newsletter-success">Başarı mesajı</Label>
              <Input
                id="block-newsletter-success"
                value={content.successMessage ?? ''}
                onChange={(event) =>
                  updateContent({ successMessage: event.target.value })
                }
              />
            </div>
          </div>
        ) : null}

        <BlockItemEditors
          blockType={block.type}
          content={block.content}
          onChange={updateContent}
        />
      </section>

      <section className="space-y-3 border-t border-slate-100 pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Görünüm
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="block-bg">Arka plan rengi</Label>
            <Input
              id="block-bg"
              type="color"
              value={settings.backgroundColor ?? '#ffffff'}
              onChange={(event) =>
                updateSettings({ backgroundColor: event.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="block-text-color">Metin rengi</Label>
            <Input
              id="block-text-color"
              type="color"
              value={settings.textColor ?? '#111827'}
              onChange={(event) =>
                updateSettings({ textColor: event.target.value })
              }
            />
          </div>
        </div>

        <div>
          <Label htmlFor="block-alignment">Hizalama</Label>
          <Select
            id="block-alignment"
            value={settings.alignment}
            onChange={(event) =>
              updateSettings({
                alignment: event.target.value as 'left' | 'center' | 'right',
              })
            }
          >
            <option value="left">Sol</option>
            <option value="center">Orta</option>
            <option value="right">Sağ</option>
          </Select>
        </div>

        <div>
          <Label htmlFor="block-width">Genişlik</Label>
          <Select
            id="block-width"
            value={settings.fullWidth ? 'full' : 'container'}
            onChange={(event) =>
              updateSettings({ fullWidth: event.target.value === 'full' })
            }
          >
            <option value="container">Container</option>
            <option value="full">Full width</option>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="block-padding-top">Üst boşluk</Label>
            <Input
              id="block-padding-top"
              value={settings.paddingTop ?? ''}
              onChange={(event) =>
                updateSettings({ paddingTop: event.target.value })
              }
              placeholder="2rem"
            />
          </div>
          <div>
            <Label htmlFor="block-padding-bottom">Alt boşluk</Label>
            <Input
              id="block-padding-bottom"
              value={settings.paddingBottom ?? ''}
              onChange={(event) =>
                updateSettings({ paddingBottom: event.target.value })
              }
              placeholder="2rem"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="block-desktop-height">Masaüstü yükseklik</Label>
            <Input
              id="block-desktop-height"
              value={settings.desktopHeight ?? ''}
              onChange={(event) =>
                updateSettings({ desktopHeight: event.target.value })
              }
              placeholder="420px"
            />
          </div>
          <div>
            <Label htmlFor="block-mobile-height">Mobil yükseklik</Label>
            <Input
              id="block-mobile-height"
              value={settings.mobileHeight ?? ''}
              onChange={(event) =>
                updateSettings({ mobileHeight: event.target.value })
              }
              placeholder="280px"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="block-mobile-visible">Mobil görünürlük</Label>
          <Select
            id="block-mobile-visible"
            value={settings.showOnMobile ? 'visible' : 'hidden'}
            onChange={(event) =>
              updateSettings({
                showOnMobile: event.target.value === 'visible',
                mobileVisible: event.target.value === 'visible',
              })
            }
          >
            <option value="visible">Mobilde göster</option>
            <option value="hidden">Mobilde gizle</option>
          </Select>
        </div>
      </section>
    </div>
  );
}
