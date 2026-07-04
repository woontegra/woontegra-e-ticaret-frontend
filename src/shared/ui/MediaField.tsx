import { Label } from './Label';
import { Input } from './Input';
import { Button } from './Button';

interface MediaFieldProps {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  description?: string;
}

export function MediaField({
  label,
  value,
  onChange,
  description,
}: MediaFieldProps) {
  return (
    <div>
      <Label>{label}</Label>
      {description ? (
        <p className="mb-1 text-xs text-slate-500">{description}</p>
      ) : null}
      <div className="flex gap-2">
        <Input
          value={value ?? ''}
          onChange={(event) =>
            onChange(event.target.value ? event.target.value : null)
          }
          placeholder="Medya ID"
          className="flex-1"
        />
        <Button type="button" variant="secondary" size="md" disabled>
          Medya seç
        </Button>
      </div>
      <p className="mt-1 text-[11px] text-slate-400">
        Medya kütüphanesi modülü eklendiğinde seçici aktif olacak.
      </p>
    </div>
  );
}
