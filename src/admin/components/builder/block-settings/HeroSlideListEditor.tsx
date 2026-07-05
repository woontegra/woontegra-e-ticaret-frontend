import { ChevronDown, ChevronUp } from 'lucide-react';
import type { BlockSlideItem } from '@/shared/lib/block-model';
import { Button, Input, Label, MediaField, Select, Textarea } from '@/shared/ui';
import { patchMediaFields } from './media-utils';

interface HeroSlideListEditorProps {
  slides: BlockSlideItem[];
  onChange: (slides: BlockSlideItem[]) => void;
}

export function HeroSlideListEditor({ slides, onChange }: HeroSlideListEditorProps) {
  const updateSlide = (index: number, patch: Partial<BlockSlideItem>) => {
    onChange(slides.map((slide, i) => (i === index ? { ...slide, ...patch } : slide)));
  };

  const moveSlide = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= slides.length) return;
    const next = [...slides];
    [next[index], next[target]] = [next[target]!, next[index]!];
    onChange(
      next.map((slide, sortOrder) => ({ ...slide, sortOrder })),
    );
  };

  const handleDesktopMedia = async (index: number, mediaId: string | null) => {
    const patch = await patchMediaFields(mediaId, {
      idKey: 'imageMediaId',
      urlKey: 'imageUrl',
    });
    updateSlide(index, patch as Partial<BlockSlideItem>);
  };

  const handleMobileMedia = async (index: number, mediaId: string | null) => {
    const patch = await patchMediaFields(mediaId, {
      idKey: 'mobileImageMediaId',
      urlKey: 'mobileImageUrl',
    });
    updateSlide(index, patch as Partial<BlockSlideItem>);
  };

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Slider slaytları
        </p>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() =>
            onChange([
              ...slides,
              {
                headline: '',
                subheadline: '',
                isActive: true,
                sortOrder: slides.length,
              },
            ])
          }
        >
          Slide ekle
        </Button>
      </div>

      {slides.length === 0 ? (
        <p className="text-xs text-slate-500">Henüz slide yok.</p>
      ) : (
        slides.map((slide, index) => (
          <div
            key={index}
            className="space-y-3 rounded-md border border-slate-100 bg-slate-50 p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-slate-700">Slide {index + 1}</p>
              <div className="flex items-center gap-1">
                <Button type="button" size="sm" variant="ghost" onClick={() => moveSlide(index, -1)}>
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => moveSlide(index, 1)}>
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => onChange(slides.filter((_, i) => i !== index))}
                >
                  Sil
                </Button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={slide.isActive !== false}
                onChange={(event) =>
                  updateSlide(index, { isActive: event.target.checked })
                }
              />
              Aktif
            </label>

            <div>
              <Label>Başlık</Label>
              <Input
                value={slide.headline ?? ''}
                onChange={(e) => updateSlide(index, { headline: e.target.value })}
              />
            </div>
            <div>
              <Label>Alt başlık</Label>
              <Input
                value={slide.subheadline ?? ''}
                onChange={(e) => updateSlide(index, { subheadline: e.target.value })}
              />
            </div>
            <div>
              <Label>Açıklama</Label>
              <Textarea
                rows={2}
                value={slide.description ?? ''}
                onChange={(e) => updateSlide(index, { description: e.target.value })}
              />
            </div>
            <MediaField
              label="Masaüstü görsel"
              value={slide.imageMediaId ?? null}
              onChange={(id) => void handleDesktopMedia(index, id)}
              folder="homepage"
            />
            <MediaField
              label="Mobil görsel"
              value={slide.mobileImageMediaId ?? null}
              onChange={(id) => void handleMobileMedia(index, id)}
              folder="homepage"
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Birincil buton</Label>
                <Input
                  value={slide.ctaLabel ?? ''}
                  onChange={(e) => updateSlide(index, { ctaLabel: e.target.value })}
                />
              </div>
              <div>
                <Label>Birincil link</Label>
                <Input
                  value={slide.ctaUrl ?? ''}
                  onChange={(e) => updateSlide(index, { ctaUrl: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>İkincil buton</Label>
                <Input
                  value={slide.secondaryCtaLabel ?? ''}
                  onChange={(e) =>
                    updateSlide(index, { secondaryCtaLabel: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>İkincil link</Label>
                <Input
                  value={slide.secondaryCtaUrl ?? ''}
                  onChange={(e) =>
                    updateSlide(index, { secondaryCtaUrl: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label>Hizalama</Label>
              <Select
                value={slide.alignment ?? 'left'}
                onChange={(e) =>
                  updateSlide(index, {
                    alignment: e.target.value as 'left' | 'center' | 'right',
                  })
                }
              >
                <option value="left">Sol</option>
                <option value="center">Orta</option>
                <option value="right">Sağ</option>
              </Select>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
