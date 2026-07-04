import { ShieldX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, Card } from '@/shared/ui';

export function UnauthorizedPage() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Card padding="md" className="max-w-md text-center">
        <ShieldX className="mx-auto h-10 w-10 text-red-500" />
        <h1 className="mt-3 text-base font-semibold text-slate-900">
          Yetkisiz erişim
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Bu sayfayı görüntülemek için gerekli role sahip değilsiniz.
        </p>
        <Link to="/admin">
          <Button className="mt-4" variant="secondary">
            Dashboard&apos;a dön
          </Button>
        </Link>
      </Card>
    </div>
  );
}
