import { Card, CardHeader } from '@/shared/ui';

interface ModulePlaceholderPageProps {
  title: string;
  description?: string;
}

export function ModulePlaceholderPage({
  title,
  description = 'Bu modül sonraki fazlarda implemente edilecek.',
}: ModulePlaceholderPageProps) {
  return (
    <Card padding="sm">
      <CardHeader title={title} description={description} />
      <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-xs text-slate-500">
        Modül içeriği yakında
      </div>
    </Card>
  );
}
