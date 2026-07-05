import type { PageBlockType } from '@/shared/types/api';
import { PAGE_BLOCK_TYPE_LABELS } from '@/shared/api/layouts.api';
import { Button, Modal } from '@/shared/ui';

const BLOCK_GROUPS: Array<{
  label: string;
  types: PageBlockType[];
}> = [
  {
    label: 'Hero & Banner',
    types: ['HERO', 'HERO_SLIDER', 'IMAGE_BANNER'],
  },
  {
    label: 'İçerik',
    types: ['TEXT', 'TEXT_IMAGE', 'CUSTOM_SPACER'],
  },
  {
    label: 'Vitrin',
    types: [
      'PRODUCT_GRID',
      'PRODUCT_CAROUSEL',
      'CATEGORY_GRID',
      'BLOG_GRID',
    ],
  },
  {
    label: 'Güven & Etkileşim',
    types: [
      'TRUST_BADGES',
      'FAQ',
      'CONTACT_FORM',
      'BRAND_LOGOS',
      'TESTIMONIALS',
      'NEWSLETTER',
    ],
  },
];

interface AddBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: PageBlockType) => void;
  isPending?: boolean;
}

export function AddBlockModal({
  isOpen,
  onClose,
  onSelect,
  isPending,
}: AddBlockModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Blok ekle" size="lg">
      <div className="space-y-5">
        {BLOCK_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {group.label}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {group.types.map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant="secondary"
                  className="h-auto justify-start px-3 py-2.5 text-left"
                  disabled={isPending}
                  onClick={() => onSelect(type)}
                >
                  <span className="block text-sm font-medium">
                    {PAGE_BLOCK_TYPE_LABELS[type]}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
