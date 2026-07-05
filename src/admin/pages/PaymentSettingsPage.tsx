import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import type {
  BankAccountConfig,
  BankTransferConfig,
  CashOnDeliveryConfig,
  ExternalLinkConfig,
  IyzicoConfig,
  PaymentMethodDto,
  PaytrConfig,
} from '@/shared/types/api';
import {
  listPaymentMethods,
  PAYMENT_METHOD_DESCRIPTIONS,
  PAYMENT_METHOD_TYPE_LABELS,
  updatePaymentMethod,
} from '@/shared/api/payment.api';
import { useAdminMutationFeedback } from '@/admin/hooks/useAdminMutationFeedback';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Input,
  Label,
  SecretField,
  Textarea,
} from '@/shared/ui';

function emptyAccount(): BankAccountConfig {
  return { bankName: '', accountHolder: '', iban: '', branch: '' };
}

function PaymentMethodSection({ method }: { method: PaymentMethodDto }) {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = useAdminMutationFeedback();
  const [name, setName] = useState(method.name);
  const [isActive, setIsActive] = useState(method.isActive);
  const [isTestMode, setIsTestMode] = useState(method.isTestMode);
  const [config, setConfig] = useState(method.config);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const saveMutation = useMutation({
    mutationFn: () =>
      updatePaymentMethod(method.id, {
        name,
        isActive,
        isTestMode,
        config,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payment-methods'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'payment-methods'] });
      setErrorMessage(null);
      onSuccess('Ödeme yöntemi kaydedildi.');
    },
    onError: (error) => {
      const message = onError(error, 'Kayıt başarısız');
      setErrorMessage(message);
    },
  });

  const bankConfig = config as BankTransferConfig;
  const codConfig = config as CashOnDeliveryConfig;
  const paytrConfig = config as PaytrConfig;
  const iyzicoConfig = config as IyzicoConfig;
  const externalConfig = config as ExternalLinkConfig;

  const updateAccounts = (accounts: BankAccountConfig[]) => {
    setConfig({ ...bankConfig, accounts });
  };

  return (
    <Card padding="sm" className="mb-4">
      <CardHeader
        title={PAYMENT_METHOD_TYPE_LABELS[method.type]}
        description={PAYMENT_METHOD_DESCRIPTIONS[method.type]}
        action={
          <div className="flex items-center gap-2">
            {isTestMode ? (
              <Badge variant="warning">Test modu</Badge>
            ) : (
              <Badge variant="success">Canlı</Badge>
            )}
            <Badge variant={isActive ? 'success' : 'default'}>
              {isActive ? 'Aktif' : 'Pasif'}
            </Badge>
          </div>
        }
      />

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <Label>Görünen ad</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Aktif
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isTestMode}
              onChange={(e) => setIsTestMode(e.target.checked)}
            />
            Test modu
          </label>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {method.type === 'BANK_TRANSFER' ? (
          <>
            <div className="flex items-center justify-between">
              <Label>Banka hesapları</Label>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() =>
                  updateAccounts([...(bankConfig.accounts ?? []), emptyAccount()])
                }
              >
                <Plus className="h-4 w-4" />
                Hesap ekle
              </Button>
            </div>
            {(bankConfig.accounts ?? []).map((account, index) => (
              <div
                key={index}
                className="grid gap-2 rounded-lg border border-slate-200 p-3 md:grid-cols-2"
              >
                <div>
                  <Label>Banka</Label>
                  <Input
                    value={account.bankName}
                    onChange={(e) => {
                      const accounts = [...(bankConfig.accounts ?? [])];
                      accounts[index] = {
                        ...accounts[index],
                        bankName: e.target.value,
                      };
                      updateAccounts(accounts);
                    }}
                  />
                </div>
                <div>
                  <Label>Hesap sahibi</Label>
                  <Input
                    value={account.accountHolder}
                    onChange={(e) => {
                      const accounts = [...(bankConfig.accounts ?? [])];
                      accounts[index] = {
                        ...accounts[index],
                        accountHolder: e.target.value,
                      };
                      updateAccounts(accounts);
                    }}
                  />
                </div>
                <div>
                  <Label>IBAN</Label>
                  <Input
                    value={account.iban}
                    onChange={(e) => {
                      const accounts = [...(bankConfig.accounts ?? [])];
                      accounts[index] = {
                        ...accounts[index],
                        iban: e.target.value,
                      };
                      updateAccounts(accounts);
                    }}
                  />
                </div>
                <div>
                  <Label>Şube (opsiyonel)</Label>
                  <Input
                    value={account.branch ?? ''}
                    onChange={(e) => {
                      const accounts = [...(bankConfig.accounts ?? [])];
                      accounts[index] = {
                        ...accounts[index],
                        branch: e.target.value || null,
                      };
                      updateAccounts(accounts);
                    }}
                  />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      updateAccounts(
                        (bankConfig.accounts ?? []).filter((_, i) => i !== index),
                      )
                    }
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
            <div>
              <Label>Havale talimatı</Label>
              <Textarea
                rows={3}
                value={bankConfig.instructions ?? ''}
                onChange={(e) =>
                  setConfig({
                    ...bankConfig,
                    instructions: e.target.value || null,
                  })
                }
              />
            </div>
          </>
        ) : null}

        {method.type === 'CASH_ON_DELIVERY' ? (
          <div>
            <Label>Açıklama</Label>
            <Textarea
              rows={3}
              value={codConfig.description ?? ''}
              onChange={(e) =>
                setConfig({
                  description: e.target.value || null,
                })
              }
              placeholder="Kapıda ödeme koşulları…"
            />
          </div>
        ) : null}

        {method.type === 'PAYTR' ? (
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label>Merchant ID</Label>
              <Input
                value={paytrConfig.merchantId ?? ''}
                onChange={(e) =>
                  setConfig({ ...paytrConfig, merchantId: e.target.value })
                }
              />
            </div>
            <SecretField
              id={`paytr-key-${method.id}`}
              label="Merchant Key"
              value={paytrConfig.merchantKey ?? ''}
              hasSecret={paytrConfig.hasMerchantKey}
              onChange={(value) =>
                setConfig({ ...paytrConfig, merchantKey: value })
              }
            />
            <div className="md:col-span-2">
              <SecretField
                id={`paytr-salt-${method.id}`}
                label="Merchant Salt"
                value={paytrConfig.merchantSalt ?? ''}
                hasSecret={paytrConfig.hasMerchantSalt}
                onChange={(value) =>
                  setConfig({ ...paytrConfig, merchantSalt: value })
                }
              />
            </div>
            <div className="md:col-span-2">
              <Label>Başarı yönlendirme URL (opsiyonel)</Label>
              <Input
                value={paytrConfig.successUrl ?? ''}
                onChange={(e) =>
                  setConfig({
                    ...paytrConfig,
                    successUrl: e.target.value || null,
                  })
                }
                placeholder="https://site.com/siparis-basarili"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Hata yönlendirme URL (opsiyonel)</Label>
              <Input
                value={paytrConfig.failUrl ?? ''}
                onChange={(e) =>
                  setConfig({
                    ...paytrConfig,
                    failUrl: e.target.value || null,
                  })
                }
                placeholder="https://site.com/odeme-basarisiz"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Callback URL (opsiyonel)</Label>
              <Input
                value={paytrConfig.callbackUrl ?? ''}
                onChange={(e) =>
                  setConfig({
                    ...paytrConfig,
                    callbackUrl: e.target.value || null,
                  })
                }
                placeholder="https://api.site.com/api/public/payments/paytr/callback"
              />
              <p className="mt-1 text-xs text-slate-500">
                Boş bırakılırsa API_PUBLIC_URL üzerinden otomatik oluşturulur.
              </p>
            </div>
          </div>
        ) : null}

        {method.type === 'IYZICO' ? (
          <div className="grid gap-3 md:grid-cols-2">
            <SecretField
              id={`iyzico-key-${method.id}`}
              label="API Key"
              value={iyzicoConfig.apiKey ?? ''}
              hasSecret={iyzicoConfig.hasApiKey}
              onChange={(value) =>
                setConfig({ ...iyzicoConfig, apiKey: value })
              }
            />
            <SecretField
              id={`iyzico-secret-${method.id}`}
              label="Secret Key"
              value={iyzicoConfig.secretKey ?? ''}
              hasSecret={iyzicoConfig.hasSecretKey}
              onChange={(value) =>
                setConfig({ ...iyzicoConfig, secretKey: value })
              }
            />
            <div className="md:col-span-2">
              <Label>Base URL</Label>
              <Input
                value={
                  iyzicoConfig.baseUrl ?? 'https://sandbox-api.iyzipay.com'
                }
                onChange={(e) =>
                  setConfig({ ...iyzicoConfig, baseUrl: e.target.value })
                }
              />
            </div>
          </div>
        ) : null}

        {method.type === 'EXTERNAL_LINK' ? (
          <div>
            <Label>Yönlendirme / talimat metni</Label>
            <Textarea
              rows={3}
              value={externalConfig.instructions ?? ''}
              onChange={(e) =>
                setConfig({
                  instructions: e.target.value || null,
                })
              }
              placeholder="Harici satın alma linki veya yönlendirme talimatı…"
            />
          </div>
        ) : null}
      </div>

      {errorMessage ? (
        <p className="mt-3 text-sm text-red-600">{errorMessage}</p>
      ) : null}

      <div className="mt-4 flex justify-end">
        <Button
          size="sm"
          disabled={saveMutation.isPending}
          onClick={() => saveMutation.mutate()}
        >
          Kaydet
        </Button>
      </div>
    </Card>
  );
}

export function PaymentSettingsPage() {
  const methodsQuery = useQuery({
    queryKey: ['admin', 'payment-methods'],
    queryFn: listPaymentMethods,
  });

  const orderedMethods = useMemo(() => {
    const order = [
      'BANK_TRANSFER',
      'CASH_ON_DELIVERY',
      'PAYTR',
      'IYZICO',
      'EXTERNAL_LINK',
    ] as const;
    const items = methodsQuery.data ?? [];
    return [...items].sort(
      (a, b) => order.indexOf(a.type) - order.indexOf(b.type),
    );
  }, [methodsQuery.data]);

  return (
    <div>
      <Card padding="sm" className="mb-4">
        <CardHeader
          title="Ödeme ayarları"
          description="Checkout sayfasında görünen ödeme yöntemlerini yönetin"
        />
      </Card>

      {methodsQuery.isLoading ? (
        <p className="text-sm text-slate-500">Yükleniyor…</p>
      ) : (
        orderedMethods.map((method) => (
          <PaymentMethodSection key={method.id} method={method} />
        ))
      )}
    </div>
  );
}
