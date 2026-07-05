import { useQuery } from '@tanstack/react-query';
import { ImageIcon, X } from 'lucide-react';
import { getMedia, isImageMedia } from '@/shared/api/media.api';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import { MediaPicker } from '@/shared/components/MediaPicker';
import { Button, Label } from '@/shared/ui';

interface MediaFieldProps {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  description?: string;
  folder?: string;
}

export function MediaField({
  label,
  value,
  onChange,
  description,
  folder = 'general',
}: MediaFieldProps) {
  const picker = useDisclosure();

  const mediaQuery = useQuery({
    queryKey: ['admin', 'media', value],
    queryFn: () => getMedia(value!),
    enabled: Boolean(value),
  });

  const preview = mediaQuery.data;

  return (
    <div>
      <Label>{label}</Label>
      {description ? (
        <p className="mb-1 text-xs text-slate-500">{description}</p>
      ) : null}

      <div className="flex items-start gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          {preview && isImageMedia(preview) ? (
            <img
              src={preview.url}
              alt={preview.altText ?? preview.originalName}
              className="h-full w-full object-cover"
            />
          ) : (
            <ImageIcon className="h-5 w-5 text-slate-300" />
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={picker.open}>
            Medya seç
          </Button>
          {value ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange(null)}
            >
              <X className="h-4 w-4" />
              Kaldır
            </Button>
          ) : null}
        </div>
      </div>

      {value ? (
        <p className="mt-1 text-[11px] text-slate-400">ID: {value}</p>
      ) : null}

      <MediaPicker
        isOpen={picker.isOpen}
        onClose={picker.close}
        folder={folder}
        onSelect={(asset) => onChange(asset.id)}
      />
    </div>
  );
}
