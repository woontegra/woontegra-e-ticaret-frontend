import type { ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type {
  BlockBadgeItem,
  BlockBrandLogoItem,
  BlockFaqItem,
  BlockTestimonialItem,
} from '@/shared/lib/block-model';
import { TRUST_ICON_OPTIONS, type TrustBadgeIconType } from '@/shared/lib/block-variants';
import { Button, Input, Label, Select, Textarea } from '@/shared/ui';

interface ItemListEditorProps<T> {
  label: string;
  items: T[];
  onChange: (items: T[]) => void;
  createEmpty: () => T;
  renderItem: (
    item: T,
    index: number,
    update: (patch: Partial<T>) => void,
    actions: { moveUp: () => void; moveDown: () => void; remove: () => void },
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

  const moveItem = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target]!, next[index]!];
    onChange(next);
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
              {renderItem(
                item,
                index,
                (patch) => updateItem(index, patch),
                {
                  moveUp: () => moveItem(index, -1),
                  moveDown: () => moveItem(index, 1),
                  remove: () => onChange(items.filter((_, i) => i !== index)),
                },
              )}
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
  if (blockType === 'TRUST_BADGES') {
    const badges = (content.badges as BlockBadgeItem[] | undefined) ?? [];
    return (
      <ItemListEditor
        label="Güven rozetleri"
        items={badges}
        onChange={(items) => onChange({ badges: items })}
        createEmpty={() => ({
          label: '',
          description: '',
          iconType: 'SHIELD' as TrustBadgeIconType,
          isActive: true,
          sortOrder: badges.length,
        })}
        renderItem={(item, _index, update, actions) => (
          <>
            <div className="flex justify-end gap-1">
              <Button type="button" size="sm" variant="ghost" onClick={actions.moveUp}>
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={actions.moveDown}>
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={actions.remove}>
                Kaldır
              </Button>
            </div>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={item.isActive !== false}
                onChange={(e) => update({ isActive: e.target.checked })}
              />
              Aktif
            </label>
            <div>
              <Label>Başlık</Label>
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
              <Label>İkon tipi</Label>
              <Select
                value={item.iconType ?? 'SHIELD'}
                onChange={(e) =>
                  update({ iconType: e.target.value as BlockBadgeItem['iconType'] })
                }
              >
                {TRUST_ICON_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            {item.iconType === 'CUSTOM' ? (
              <div>
                <Label>Özel ikon URL</Label>
                <Input
                  value={item.iconUrl ?? ''}
                  onChange={(e) => update({ iconUrl: e.target.value })}
                />
              </div>
            ) : null}
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
        renderItem={(item, _index, update, actions) => (
          <>
            <div className="flex justify-end">
              <Button type="button" size="sm" variant="ghost" onClick={actions.remove}>
                Kaldır
              </Button>
            </div>
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
        renderItem={(item, _index, update, actions) => (
          <>
            <div className="flex justify-end">
              <Button type="button" size="sm" variant="ghost" onClick={actions.remove}>
                Kaldır
              </Button>
            </div>
            <div>
              <Label>Ad</Label>
              <Input value={item.name} onChange={(e) => update({ name: e.target.value })} />
            </div>
            <div>
              <Label>Ünvan</Label>
              <Input value={item.role ?? ''} onChange={(e) => update({ role: e.target.value })} />
            </div>
            <div>
              <Label>Alıntı</Label>
              <Textarea rows={3} value={item.quote} onChange={(e) => update({ quote: e.target.value })} />
            </div>
          </>
        )}
      />
    );
  }

  if (blockType === 'BRAND_LOGOS') {
    const brandLogos = (content.brandLogos as BlockBrandLogoItem[] | undefined) ?? [];
    return (
      <ItemListEditor
        label="Marka logoları"
        items={brandLogos}
        onChange={(items) => onChange({ brandLogos: items })}
        createEmpty={() => ({ imageUrl: '', name: '', linkUrl: '' })}
        renderItem={(item, _index, update, actions) => (
          <>
            <div className="flex justify-end">
              <Button type="button" size="sm" variant="ghost" onClick={actions.remove}>
                Kaldır
              </Button>
            </div>
            <div>
              <Label>Marka adı</Label>
              <Input value={item.name ?? ''} onChange={(e) => update({ name: e.target.value })} />
            </div>
            <div>
              <Label>Logo URL</Label>
              <Input value={item.imageUrl} onChange={(e) => update({ imageUrl: e.target.value })} />
            </div>
          </>
        )}
      />
    );
  }

  if (blockType === 'HERO_SLIDER') {
    return null;
  }

  return null;
}
