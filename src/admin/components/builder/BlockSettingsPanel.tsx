import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listCampaigns } from '@/shared/api/promotions.api';
import { PAGE_BLOCK_TYPE_LABELS } from '@/shared/api/layouts.api';
import {
  migrateHeroToCarouselContent,
  parseBlockContent,
  parseBlockSettings,
} from '@/shared/lib/block-model';
import {
  BLOG_DISPLAY_MODE_LABELS,
  HERO_VARIANT_LABELS,
  PRODUCT_DISPLAY_MODE_LABELS,
  type HeroVariant,
} from '@/shared/lib/block-variants';
import type { PageBlockDto, PageBlockType } from '@/shared/types/api';
import { Input, Label, MediaField, Select, Textarea } from '@/shared/ui';
import { BlockItemEditors } from '@/admin/components/builder/BlockItemEditors';
import { HeroSlideListEditor } from '@/admin/components/builder/block-settings/HeroSlideListEditor';
import { patchMediaFields } from '@/admin/components/builder/block-settings/media-utils';
import { cn } from '@/shared/lib/cn';

interface BlockSettingsPanelProps {
  block: PageBlockDto | null;
  onChange: (block: PageBlockDto) => void;
}

type SettingsTab = 'content' | 'appearance' | 'behavior' | 'mobile' | 'advanced';

const TABS: Array<{ id: SettingsTab; label: string }> = [
  { id: 'content', label: 'İçerik' },
  { id: 'appearance', label: 'Görünüm' },
  { id: 'behavior', label: 'Davranış' },
  { id: 'mobile', label: 'Mobil' },
  { id: 'advanced', label: 'Gelişmiş' },
];

function isHeroBlock(type: PageBlockType): boolean {
  return type === 'HERO' || type === 'HERO_SLIDER';
}

export function BlockSettingsPanel({ block, onChange }: BlockSettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('content');

  const updateContent = useCallback(
    (patch: Record<string, unknown>) => {
      if (!block) return;
      onChange({ ...block, content: { ...block.content, ...patch } });
    },
    [block, onChange],
  );

  const updateSettings = useCallback(
    (patch: Record<string, unknown>) => {
      if (!block) return;
      onChange({ ...block, settings: { ...block.settings, ...patch } });
    },
    [block, onChange],
  );

  const campaignsQuery = useQuery({
    queryKey: ['admin', 'campaigns', 'options'],
    queryFn: () => listCampaigns({ limit: 200 }),
    select: (data) => data.items,
    enabled: block?.type === 'CAMPAIGN',
  });

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
  const heroVariant =
    block.type === 'HERO_SLIDER'
      ? 'CAROUSEL_SLIDER'
      : (settings.variant ?? 'SIMPLE');
  const slides = (block.content.slides as typeof content.slides) ?? [];

  const handleTitleChange = (nextTitle: string) => {
    onChange({
      ...block,
      title: nextTitle,
      content: { ...block.content, headline: nextTitle },
    });
  };

  const handleHeroVariantChange = (variant: HeroVariant) => {
    let nextContent = { ...block.content };
    if (variant === 'CAROUSEL_SLIDER') {
      nextContent = migrateHeroToCarouselContent(nextContent);
    }
    onChange({
      ...block,
      type: variant === 'CAROUSEL_SLIDER' ? block.type : 'HERO',
      settings: { ...block.settings, variant },
      content: nextContent,
    });
  };

  const handleMainMediaChange = async (mediaId: string | null) => {
    const patch = await patchMediaFields(mediaId, {
      idKey: 'imageMediaId',
      urlKey: 'imageUrl',
    });
    updateContent(patch);
  };

  const handleBackgroundImageChange = async (mediaId: string | null) => {
    const patch = await patchMediaFields(mediaId, {
      idKey: 'backgroundImageId',
      urlKey: 'backgroundImageUrl',
    });
    updateSettings(patch);
  };

  const slider = (block.settings.slider as Record<string, unknown> | undefined) ?? {};

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Blok tipi
        </p>
        <p className="mt-1 text-sm font-medium text-slate-800">
          {PAGE_BLOCK_TYPE_LABELS[block.type]}
        </p>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-slate-200 px-2 py-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'rounded-md px-2.5 py-1.5 text-xs font-medium',
              activeTab === tab.id
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {activeTab === 'content' ? (
          <>
            {isHeroBlock(block.type) ? (
              <div>
                <Label htmlFor="hero-variant">Hero tipi</Label>
                <Select
                  id="hero-variant"
                  value={heroVariant}
                  onChange={(e) =>
                    handleHeroVariantChange(e.target.value as HeroVariant)
                  }
                >
                  {Object.entries(HERO_VARIANT_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>
            ) : null}

            {block.type === 'PRODUCT_GRID' || block.type === 'PRODUCT_CAROUSEL' ? (
              <div>
                <Label>Görünüm modu</Label>
                <Select
                  value={settings.displayMode ?? 'GRID'}
                  onChange={(e) => updateSettings({ displayMode: e.target.value })}
                >
                  {Object.entries(PRODUCT_DISPLAY_MODE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>
            ) : null}

            {block.type === 'BLOG_GRID' ? (
              <div>
                <Label>Görünüm modu</Label>
                <Select
                  value={settings.displayMode ?? 'GRID'}
                  onChange={(e) => updateSettings({ displayMode: e.target.value })}
                >
                  {Object.entries(BLOG_DISPLAY_MODE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>
            ) : null}

            <div>
              <Label htmlFor="block-title">Başlık</Label>
              <Input
                id="block-title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
              />
            </div>

            {heroVariant !== 'CAROUSEL_SLIDER' ? (
              <>
                <div>
                  <Label>Alt başlık</Label>
                  <Input
                    value={content.subheadline ?? ''}
                    onChange={(e) => updateContent({ subheadline: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Açıklama</Label>
                  <Textarea
                    rows={3}
                    value={content.description ?? ''}
                    onChange={(e) => updateContent({ description: e.target.value })}
                  />
                </div>
                {(block.type === 'HERO' || block.type === 'HERO_SLIDER') ? (
                  <>
                    <MediaField
                      label="Hero görseli"
                      value={content.imageMediaId ?? null}
                      onChange={(id) => void handleMainMediaChange(id)}
                      folder="homepage"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Birincil buton</Label>
                        <Input
                          value={content.ctaLabel ?? ''}
                          onChange={(e) => updateContent({ ctaLabel: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Birincil link</Label>
                        <Input
                          value={content.ctaUrl ?? ''}
                          onChange={(e) => updateContent({ ctaUrl: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>İkincil buton</Label>
                        <Input
                          value={content.secondaryCtaLabel ?? ''}
                          onChange={(e) =>
                            updateContent({ secondaryCtaLabel: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label>İkincil link</Label>
                        <Input
                          value={content.secondaryCtaUrl ?? ''}
                          onChange={(e) =>
                            updateContent({ secondaryCtaUrl: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </>
                ) : null}
              </>
            ) : null}

            {heroVariant === 'CAROUSEL_SLIDER' ? (
              <HeroSlideListEditor
                slides={slides ?? []}
                onChange={(items) => updateContent({ slides: items })}
              />
            ) : null}

            {(block.type === 'PRODUCT_GRID' || block.type === 'PRODUCT_CAROUSEL') && (
              <div className="space-y-3 rounded-lg border border-slate-200 p-3">
                <p className="text-xs font-semibold uppercase text-slate-500">Ürün kaynağı</p>
                <div>
                  <Label>Kaynak</Label>
                  <Select
                    value={settings.source ?? 'ALL'}
                    onChange={(e) => updateSettings({ source: e.target.value })}
                  >
                    <option value="ALL">Tüm ürünler</option>
                    <option value="FEATURED">Öne çıkanlar</option>
                    <option value="CATEGORY">Kategori</option>
                  </Select>
                </div>
                <div>
                  <Label>Ürün tipi</Label>
                  <Select
                    value={settings.productKind ?? ''}
                    onChange={(e) => updateSettings({ productKind: e.target.value || undefined })}
                  >
                    <option value="">Tümü</option>
                    <option value="SOFTWARE">Yazılım</option>
                    <option value="PHYSICAL">Fiziksel</option>
                    <option value="SERVICE">Hizmet</option>
                  </Select>
                </div>
                <div>
                  <Label>Kategori slug</Label>
                  <Input
                    value={settings.categorySlug ?? ''}
                    onChange={(e) => updateSettings({ categorySlug: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Adet</Label>
                    <Input
                      type="number"
                      min={1}
                      max={24}
                      value={settings.itemCount ?? ''}
                      onChange={(e) =>
                        updateSettings({
                          itemCount: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Kolon</Label>
                    <Input
                      type="number"
                      min={1}
                      max={6}
                      value={settings.columns ?? ''}
                      onChange={(e) =>
                        updateSettings({
                          columns: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label>Kart tipi</Label>
                  <Select
                    value={settings.cardStyle ?? 'PREMIUM'}
                    onChange={(e) => updateSettings({ cardStyle: e.target.value })}
                  >
                    <option value="SIMPLE">Simple</option>
                    <option value="PREMIUM">Premium</option>
                    <option value="COMPACT">Compact</option>
                  </Select>
                </div>
                {(
                  [
                    ['showPrice', 'Fiyat göster'],
                    ['showBadge', 'Rozet göster'],
                    ['showDescription', 'Açıklama göster'],
                    ['showCta', 'CTA göster'],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={settings[key] ?? true}
                      onChange={(e) => updateSettings({ [key]: e.target.checked })}
                    />
                    {label}
                  </label>
                ))}
              </div>
            )}

            {block.type === 'BLOG_GRID' && (
              <div className="space-y-3 rounded-lg border border-slate-200 p-3">
                <div>
                  <Label>Kategori slug</Label>
                  <Input
                    value={settings.blogCategorySlug ?? ''}
                    onChange={(e) => updateSettings({ blogCategorySlug: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Adet</Label>
                    <Input
                      type="number"
                      value={settings.itemCount ?? ''}
                      onChange={(e) =>
                        updateSettings({
                          itemCount: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Kolon</Label>
                    <Input
                      type="number"
                      value={settings.columns ?? ''}
                      onChange={(e) =>
                        updateSettings({
                          columns: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>
                </div>
                {(
                  [
                    ['showCover', 'Kapak görseli'],
                    ['showExcerpt', 'Özet göster'],
                    ['showDate', 'Tarih göster'],
                    ['showCategory', 'Kategori göster'],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={settings[key] ?? true}
                      onChange={(e) => updateSettings({ [key]: e.target.checked })}
                    />
                    {label}
                  </label>
                ))}
              </div>
            )}

            {block.type === 'CAMPAIGN' ? (
              <div>
                <Label>Kampanya</Label>
                <Select
                  value={content.campaignId ?? ''}
                  onChange={(e) => updateContent({ campaignId: e.target.value })}
                >
                  <option value="">Seçin…</option>
                  {(campaignsQuery.data ?? []).map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </option>
                  ))}
                </Select>
              </div>
            ) : null}

            <BlockItemEditors
              blockType={block.type}
              content={block.content}
              onChange={updateContent}
            />

            {block.type === 'TEXT' ? (
              <div>
                <Label>Metin gövdesi</Label>
                <Textarea
                  rows={6}
                  value={content.body ?? ''}
                  onChange={(e) => updateContent({ body: e.target.value })}
                />
              </div>
            ) : null}

            {block.type === 'IMAGE_BANNER' ? (
              <>
                <MediaField
                  label="Banner görseli"
                  value={content.imageMediaId ?? null}
                  onChange={(id) => void handleMainMediaChange(id)}
                  folder="homepage"
                />
                <div>
                  <Label>Link URL</Label>
                  <Input
                    value={content.linkUrl ?? ''}
                    onChange={(e) => updateContent({ linkUrl: e.target.value })}
                  />
                </div>
              </>
            ) : null}
          </>
        ) : null}

        {activeTab === 'appearance' ? (
          <>
            <div>
              <Label>Container modu</Label>
              <Select
                value={settings.containerMode ?? 'CONTAINER'}
                onChange={(e) =>
                  updateSettings({
                    containerMode: e.target.value,
                    fullWidth: e.target.value === 'FULL_WIDTH',
                  })
                }
              >
                <option value="CONTAINER">Container</option>
                <option value="WIDE">Wide</option>
                <option value="FULL_WIDTH">Full width</option>
              </Select>
            </div>
            <div>
              <Label>Arka plan tipi</Label>
              <Select
                value={settings.backgroundType ?? 'NONE'}
                onChange={(e) => updateSettings({ backgroundType: e.target.value })}
              >
                <option value="NONE">Yok</option>
                <option value="COLOR">Renk</option>
                <option value="GRADIENT">Gradient</option>
                <option value="IMAGE">Görsel</option>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Arka plan rengi</Label>
                <Input
                  type="color"
                  value={settings.backgroundColor ?? '#ffffff'}
                  onChange={(e) => updateSettings({ backgroundColor: e.target.value })}
                />
              </div>
              <div>
                <Label>Metin rengi</Label>
                <Input
                  type="color"
                  value={settings.textColor ?? '#111827'}
                  onChange={(e) => updateSettings({ textColor: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Gradient</Label>
              <Input
                value={settings.backgroundGradient ?? ''}
                onChange={(e) => updateSettings({ backgroundGradient: e.target.value })}
                placeholder="linear-gradient(...)"
              />
            </div>
            {settings.backgroundType === 'IMAGE' ? (
              <MediaField
                label="Arka plan görseli"
                value={settings.backgroundImageId ?? null}
                onChange={(id) => void handleBackgroundImageChange(id)}
                folder="homepage"
              />
            ) : null}
            <div>
              <Label>Hizalama</Label>
              <Select
                value={settings.alignment}
                onChange={(e) => updateSettings({ alignment: e.target.value })}
              >
                <option value="left">Sol</option>
                <option value="center">Orta</option>
                <option value="right">Sağ</option>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Üst boşluk</Label>
                <Input
                  value={settings.paddingTop ?? ''}
                  onChange={(e) => updateSettings({ paddingTop: e.target.value })}
                />
              </div>
              <div>
                <Label>Alt boşluk</Label>
                <Input
                  value={settings.paddingBottom ?? ''}
                  onChange={(e) => updateSettings({ paddingBottom: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Border radius</Label>
              <Input
                value={settings.borderRadius ?? ''}
                onChange={(e) => updateSettings({ borderRadius: e.target.value })}
              />
            </div>
          </>
        ) : null}

        {activeTab === 'behavior' &&
        (heroVariant === 'CAROUSEL_SLIDER' ||
          settings.displayMode === 'CAROUSEL') ? (
          <>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(slider.autoplay ?? true)}
                onChange={(e) =>
                  updateSettings({
                    slider: { ...slider, autoplay: e.target.checked },
                  })
                }
              />
              Autoplay
            </label>
            <div>
              <Label>Autoplay gecikme (ms)</Label>
              <Input
                type="number"
                value={Number(slider.autoplayDelay ?? 6000)}
                onChange={(e) =>
                  updateSettings({
                    slider: { ...slider, autoplayDelay: Number(e.target.value) },
                  })
                }
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(slider.showDots ?? true)}
                onChange={(e) =>
                  updateSettings({ slider: { ...slider, showDots: e.target.checked } })
                }
              />
              Dots
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(slider.showArrows ?? true)}
                onChange={(e) =>
                  updateSettings({ slider: { ...slider, showArrows: e.target.checked } })
                }
              />
              Oklar
            </label>
            <div>
              <Label>Geçiş efekti</Label>
              <Select
                value={String(slider.transitionEffect ?? 'FADE')}
                onChange={(e) =>
                  updateSettings({ slider: { ...slider, transitionEffect: e.target.value } })
                }
              >
                <option value="FADE">Fade</option>
                <option value="SLIDE">Slide</option>
              </Select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(slider.loop ?? true)}
                onChange={(e) =>
                  updateSettings({ slider: { ...slider, loop: e.target.checked } })
                }
              />
              Loop
            </label>
          </>
        ) : activeTab === 'behavior' ? (
          <p className="text-sm text-slate-500">Bu blok için davranış ayarı yok.</p>
        ) : null}

        {activeTab === 'mobile' ? (
          <>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={settings.mobileVisible ?? true}
                onChange={(e) =>
                  updateSettings({
                    mobileVisible: e.target.checked,
                    showOnMobile: e.target.checked,
                  })
                }
              />
              Mobilde göster
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={settings.desktopVisible ?? true}
                onChange={(e) => updateSettings({ desktopVisible: e.target.checked })}
              />
              Masaüstünde göster
            </label>
            <div>
              <Label>Mobil yükseklik</Label>
              <Input
                value={settings.mobileHeight ?? ''}
                onChange={(e) => updateSettings({ mobileHeight: e.target.value })}
              />
            </div>
            <div>
              <Label>Mobil kolon</Label>
              <Input
                type="number"
                value={settings.columnsMobile ?? ''}
                onChange={(e) =>
                  updateSettings({
                    columnsMobile: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>
          </>
        ) : null}

        {activeTab === 'advanced' ? (
          <>
            <div>
              <Label>Masaüstü yükseklik</Label>
              <Input
                value={settings.desktopHeight ?? ''}
                onChange={(e) => updateSettings({ desktopHeight: e.target.value })}
              />
            </div>
            <div>
              <Label>Özel CSS sınıfı</Label>
              <Input
                value={settings.customClass ?? ''}
                onChange={(e) => updateSettings({ customClass: e.target.value })}
              />
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
