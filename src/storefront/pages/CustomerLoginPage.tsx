import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { loginCustomer, registerCustomer } from '@/shared/api/customer.api';
import { ApiError } from '@/shared/api/client';
import { useCustomerAuthStore } from '@/shared/auth/customerAuth.store';
import { Button, Input, Label } from '@/shared/ui';
import { SeoHead } from '@/storefront/components/SeoHead';

export function CustomerLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const accessToken = useCustomerAuthStore((state) => state.accessToken);
  const setAuth = useCustomerAuthStore((state) => state.setAuth);

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const returnTo =
    (location.state as { returnTo?: string } | null)?.returnTo ?? '/odeme';

  const authMutation = useMutation({
    mutationFn: () =>
      mode === 'login'
        ? loginCustomer({ email, password })
        : registerCustomer({
            name,
            email,
            password,
            phone: phone.trim() || null,
          }),
    onSuccess: (data) => {
      setAuth({
        accessToken: data.accessToken,
        customer: data.customer,
      });
      navigate(returnTo, { replace: true });
    },
    onError: (error) => {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : 'Giriş işlemi başarısız oldu.',
      );
    },
  });

  if (accessToken) {
    return <Navigate to={returnTo} replace />;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    authMutation.mutate();
  };

  return (
    <>
      <SeoHead title="Hesabınıza Giriş Yapın" robotsIndex={false} />

      <div className="mx-auto max-w-md">
        <header className="mb-6 text-center">
          <h1 className="theme-heading text-2xl sm:text-3xl">
            {mode === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'}
          </h1>
          <p className="mt-2 text-theme-muted">
            {mode === 'login'
              ? 'SaaS aboneliği satın almak için hesabınıza giriş yapın.'
              : 'Yeni müşteri hesabı oluşturun.'}
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4 rounded-lg border border-slate-200 bg-white p-6"
        >
          {mode === 'register' ? (
            <>
              <div>
                <Label htmlFor="name" required>
                  Ad Soyad
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </div>
            </>
          ) : null}

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
              autoComplete={
                mode === 'login' ? 'current-password' : 'new-password'
              }
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
            />
          </div>

          {errorMessage ? (
            <p className="text-sm text-red-600">{errorMessage}</p>
          ) : null}

          <Button type="submit" className="w-full" disabled={authMutation.isPending}>
            {mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
          </Button>

          <p className="text-center text-sm text-slate-600">
            {mode === 'login' ? (
              <>
                Hesabınız yok mu?{' '}
                <button
                  type="button"
                  className="font-medium text-slate-900 underline"
                  onClick={() => setMode('register')}
                >
                  Kayıt olun
                </button>
              </>
            ) : (
              <>
                Zaten hesabınız var mı?{' '}
                <button
                  type="button"
                  className="font-medium text-slate-900 underline"
                  onClick={() => setMode('login')}
                >
                  Giriş yapın
                </button>
              </>
            )}
          </p>
        </form>

        <p className="mt-4 text-center text-sm">
          <Link to="/" className="text-slate-600 hover:underline">
            Ana sayfaya dön
          </Link>
        </p>
      </div>
    </>
  );
}
