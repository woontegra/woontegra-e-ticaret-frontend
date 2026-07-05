import { useQuery } from '@tanstack/react-query';
import { ImageIcon, X } from 'lucide-react';
import { getMedia, isImageMedia } from '@/shared/api/media.api';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import { MediaPicker } from '@/shared/components/MediaPicker';
import type { MediaUsageType } from '@/shared/types/api';
import { Button, Label } from '@/shared/ui';

interface MediaMultiFieldProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  description?: string;
  folder?: string;
  usageType?: MediaUsageType;
}

function MediaPreview({ id, onRemove }: { id: string; onRemove: () => void }) {
  const mediaQuery = useQuery({
    queryKey: ['admin', 'media', id],
    queryFn: () => getMedia(id),
  });

  const preview = mediaQuery.data;

  return (
    <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
      {preview && isImageMedia(preview) ? (
        <img
          src={preview.url}
          alt={preview.altText ?? preview.originalName}
          className="h-full w-full object-contain p-1"
        />
      ) : (
        <ImageIcon className="h-4 w-4 text-slate-300" />
      )}
      <button
        type="button"
        onClick={onRemove}
        className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white"
        aria-label="Kaldır"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

export function MediaMultiField({
  label,
  value,
  onChange,
  description,
  folder = 'general',
  usageType = 'IMAGE',
}: MediaMultiFieldProps) {
  const picker = useDisclosure();

  const handleSelect = (asset: { id: string }) => {
    if (!value.includes(asset.id)) {
      onChange([...value, asset.id]);
    }
    picker.close();
  };

  return (
    <div>
      <Label>{label}</Label>
      {description ? (
        <p className="mb-1 text-xs text-slate-500">{description}</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {value.map((id) => (
          <MediaPreview
            key={id}
            id={id}
            onRemove={() => onChange(value.filter((item) => item !== id))}
          />
        ))}
        <Button type="button" variant="secondary" size="sm" onClick={picker.open}>
          Galeri görseli ekle
        </Button>
      </div>

      <MediaPicker
        isOpen={picker.isOpen}
        onClose={picker.close}
        folder={folder}
        usageType={usageType}
        onSelect={handleSelect}
      />
    </div>
  );
}
