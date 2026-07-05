import type { ReactNode } from 'react';
import type {
  BlockBadgeItem,
  BlockBrandLogoItem,
  BlockFaqItem,
  BlockSlideItem,
  BlockTestimonialItem,
} from '@/shared/lib/block-model';
import { Button, Input, Label, Textarea } from '@/shared/ui';

interface ItemListEditorProps<T> {
  label: string;
  items: T[];
  onChange: (items: T[]) => void;
  createEmpty: () => T;
  renderItem: (
    item: T,
    index: number,
    update: (patch: Partial<T>) => void,
  ) => ReactNode;
}

function ItemListEditor<T>({
  label,
  items,
  onChange,
  createEmpty,
  renderItem,
}: ItemListEditorProps<T>) {
  const updateItem = (index: number, patch: Partial<T>) => {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => onChange([...items, createEmpty()])}
        >
          Ekle
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-slate-500">Henüz öğe yok.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="space-y-2 rounded-md border border-slate-100 bg-slate-50 p-3"
            >
              {renderItem(item, index, (patch) => updateItem(index, patch))}
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => removeItem(index)}
              >
                Kaldır
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface BlockItemEditorsProps {
  blockType: string;
  content: Record<string, unknown>;
  onChange: (patch: Record<string, unknown>) => void;
}

export function BlockItemEditors({
  blockType,
  content,
  onChange,
}: BlockItemEditorsProps) {
  if (blockType === 'HERO_SLIDER') {
    const slides = (content.slides as BlockSlideItem[] | undefined) ?? [];
    return (
      <ItemListEditor
        label="Slaytlar"
        items={slides}
        onChange={(items) => onChange({ slides: items })}
        createEmpty={() => ({ headline: '', ctaLabel: '', ctaUrl: '' })}
        renderItem={(item, _index, update) => (
          <>
            <div>
              <Label>Başlık</Label>
              <Input
                value={item.headline ?? ''}
                onChange={(e) => update({ headline: e.target.value })}
              />
            </div>
            <div>
              <Label>Alt başlık</Label>
              <Input
                value={item.subheadline ?? ''}
                onChange={(e) => update({ subheadline: e.target.value })}
              />
            </div>
            <div>
              <Label>Görsel URL</Label>
              <Input
                value={item.imageUrl ?? ''}
                onChange={(e) => update({ imageUrl: e.target.value })}
              />
            </div>
            <div>
              <Label>Buton metni</Label>
              <Input
                value={item.ctaLabel ?? ''}
                onChange={(e) => update({ ctaLabel: e.target.value })}
              />
            </div>
            <div>
              <Label>Buton linki</Label>
              <Input
                value={item.ctaUrl ?? ''}
                onChange={(e) => update({ ctaUrl: e.target.value })}
              />
            </div>
          </>
        )}
      />
    );
  }

  if (blockType === 'TRUST_BADGES') {
    const badges = (content.badges as BlockBadgeItem[] | undefined) ?? [];
    return (
      <ItemListEditor
        label="Güven rozetleri"
        items={badges}
        onChange={(items) => onChange({ badges: items })}
        createEmpty={() => ({ label: '', description: '', iconUrl: '' })}
        renderItem={(item, _index, update) => (
          <>
            <div>
              <Label>Etiket</Label>
              <Input
                value={item.label}
                onChange={(e) => update({ label: e.target.value })}
              />
            </div>
            <div>
              <Label>Açıklama</Label>
              <Input
                value={item.description ?? ''}
                onChange={(e) => update({ description: e.target.value })}
              />
            </div>
            <div>
              <Label>İkon URL</Label>
              <Input
                value={item.iconUrl ?? ''}
                onChange={(e) => update({ iconUrl: e.target.value })}
              />
            </div>
          </>
        )}
      />
    );
  }

  if (blockType === 'FAQ') {
    const faqItems = (content.faqItems as BlockFaqItem[] | undefined) ?? [];
    return (
      <ItemListEditor
        label="Soru / cevap"
        items={faqItems}
        onChange={(items) => onChange({ faqItems: items })}
        createEmpty={() => ({ question: '', answer: '' })}
        renderItem={(item, _index, update) => (
          <>
            <div>
              <Label>Soru</Label>
              <Input
                value={item.question}
                onChange={(e) => update({ question: e.target.value })}
              />
            </div>
            <div>
              <Label>Cevap</Label>
              <Textarea
                rows={3}
                value={item.answer}
                onChange={(e) => update({ answer: e.target.value })}
              />
            </div>
          </>
        )}
      />
    );
  }

  if (blockType === 'TESTIMONIALS') {
    const testimonials =
      (content.testimonials as BlockTestimonialItem[] | undefined) ?? [];
    return (
      <ItemListEditor
        label="Referanslar"
        items={testimonials}
        onChange={(items) => onChange({ testimonials: items })}
        createEmpty={() => ({ name: '', quote: '', role: '', avatarUrl: '' })}
        renderItem={(item, _index, update) => (
          <>
            <div>
              <Label>Ad</Label>
              <Input
                value={item.name}
                onChange={(e) => update({ name: e.target.value })}
              />
            </div>
            <div>
              <Label>Ünvan</Label>
              <Input
                value={item.role ?? ''}
                onChange={(e) => update({ role: e.target.value })}
              />
            </div>
            <div>
              <Label>Alıntı</Label>
              <Textarea
                rows={3}
                value={item.quote}
                onChange={(e) => update({ quote: e.target.value })}
              />
            </div>
            <div>
              <Label>Avatar URL</Label>
              <Input
                value={item.avatarUrl ?? ''}
                onChange={(e) => update({ avatarUrl: e.target.value })}
              />
            </div>
          </>
        )}
      />
    );
  }

  if (blockType === 'BRAND_LOGOS') {
    const brandLogos =
      (content.brandLogos as BlockBrandLogoItem[] | undefined) ?? [];
    return (
      <ItemListEditor
        label="Marka logoları"
        items={brandLogos}
        onChange={(items) => onChange({ brandLogos: items })}
        createEmpty={() => ({ imageUrl: '', name: '', linkUrl: '' })}
        renderItem={(item, _index, update) => (
          <>
            <div>
              <Label>Marka adı</Label>
              <Input
                value={item.name ?? ''}
                onChange={(e) => update({ name: e.target.value })}
              />
            </div>
            <div>
              <Label>Logo URL</Label>
              <Input
                value={item.imageUrl}
                onChange={(e) => update({ imageUrl: e.target.value })}
              />
            </div>
            <div>
              <Label>Link</Label>
              <Input
                value={item.linkUrl ?? ''}
                onChange={(e) => update({ linkUrl: e.target.value })}
              />
            </div>
          </>
        )}
      />
    );
  }

  return null;
}
