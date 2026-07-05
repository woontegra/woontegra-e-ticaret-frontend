import { Input, Label } from '@/shared/ui';

interface SecretFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hasSecret?: boolean;
  placeholder?: string;
}

export function SecretField({
  id,
  label,
  value,
  onChange,
  hasSecret = false,
  placeholder,
}: SecretFieldProps) {
  const displayPlaceholder =
    placeholder ??
    (hasSecret && !value ? 'Kayıtlı — değiştirmek için yeni değer girin' : '');

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={displayPlaceholder}
        autoComplete="new-password"
      />
      {hasSecret && !value ? (
        <p className="mt-1 text-xs text-slate-500">Mevcut değer kayıtlı.</p>
      ) : null}
    </div>
  );
}
