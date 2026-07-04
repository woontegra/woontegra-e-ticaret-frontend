import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { login } from '@/shared/api/auth.api';
import { ApiError } from '@/shared/api/client';
import { useAuthStore } from '@/shared/auth/auth.store';
import { Button, Card, Input, Label } from '@/shared/ui';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const accessToken = useAuthStore((state) => state.accessToken);
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const from =
    (location.state as { from?: { pathname: string } } | null)?.from
      ?.pathname ?? '/admin';

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAuth({
        accessToken: data.accessToken,
        user: data.user,
      });
      navigate(from, { replace: true });
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        setErrorMessage(error.errors[0]?.message ?? 'Giriş başarısız');
        return;
      }
      setErrorMessage('Sunucuya bağlanılamadı. API adresini kontrol edin.');
    },
  });

  if (accessToken) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="mb-4 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
            W
          </div>
          <h1 className="text-lg font-semibold text-slate-900">Admin Girişi</h1>
          <p className="mt-1 text-xs text-slate-500">
            Woontegra Commerce yönetim paneli
          </p>
        </div>

        <Card padding="md">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="email" required>
                E-posta
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="password" required>
                Şifre
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            {errorMessage ? (
              <p className="rounded-md bg-red-50 px-2 py-1.5 text-xs text-red-700">
                {errorMessage}
              </p>
            ) : null}

            <Button
              type="submit"
              className="w-full"
              isLoading={loginMutation.isPending}
            >
              Giriş yap
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
