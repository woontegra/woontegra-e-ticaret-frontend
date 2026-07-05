import { ShieldX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/shared/auth/auth.store';
import { Button } from '@/shared/ui';

export function UnauthorizedPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <ShieldX className="mx-auto h-10 w-10 text-red-500" />
        <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-400">
          403
        </p>
        <h1 className="mt-1 text-base font-semibold text-slate-900">
          Bu sayfaya erişim yetkiniz yok
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {user?.role
            ? `Hesabınız (${user.role}) bu işlem için yeterli yetkiye sahip değil.`
            : 'Bu işlem için gerekli role sahip değilsiniz.'}
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Link to="/admin">
            <Button variant="secondary" size="sm">
              Dashboard
            </Button>
          </Link>
          <Link to="/admin/login">
            <Button variant="ghost" size="sm">
              Farklı hesap
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
