import type { DeliveryMode, ProductDto } from '@/shared/types/api';
import { FormSection } from '@/admin/components/ui';
import { ProductDownloadFilesEditor } from '@/admin/components/products/ProductDownloadFilesEditor';
import { Input, Label } from '@/shared/ui';

interface ProductDeliveryTabProps {
  deliveryMode: DeliveryMode;
  form: Partial<ProductDto>;
  onChange: <K extends keyof ProductDto>(
    key: K,
    value: ProductDto[K],
  ) => void;
}

export function ProductDeliveryTab({
  deliveryMode,
  form,
  onChange,
}: ProductDeliveryTabProps) {
  if (deliveryMode === 'QUOTE_ONLY') {
    return (
      <FormSection
        title="Teklif akışı"
        description="Bu ürün sepete eklenmez; müşteriler teklif formu üzerinden iletişime geçer."
      >
        <p className="text-sm text-[rgb(var(--admin-text-muted))]">
          Teslimat ve lisans alanları hizmet ürünleri için devre dışıdır.
          İletişim sayfası veya form builder üzerinden teklif akışını
          yönlendirin.
        </p>
      </FormSection>
    );
  }

  if (deliveryMode === 'FREE_DOWNLOAD') {
    return (
      <FormSection
        title="Ücretsiz indirme"
        description="Herkese açık indirilebilir dosya tanımları"
      >
        {form.downloadFiles ? (
          <ProductDownloadFilesEditor
            value={form.downloadFiles}
            onChange={(value) => onChange('downloadFiles', value)}
            showPaymentFlags
          />
        ) : null}
      </FormSection>
    );
  }

  if (deliveryMode === 'PAID_DOWNLOAD' || deliveryMode === 'LICENSED_DOWNLOAD') {
    return (
      <>
        <FormSection
          title="İndirilebilir dosyalar"
          description="Ödeme sonrası müşteriye sunulacak kurulum dosyaları"
        >
          {form.downloadFiles ? (
            <ProductDownloadFilesEditor
              value={form.downloadFiles}
              onChange={(value) => onChange('downloadFiles', value)}
            />
          ) : null}
        </FormSection>

        {deliveryMode === 'LICENSED_DOWNLOAD' ? (
          <FormSection
            title="Merkezi lisans"
            description="Woontegra Lisans Server entegrasyonu sonraki fazda aktif olacak"
          >
            <div className="mb-3 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-900">
              Lisans sunucusu bağlantısı henüz kurulmadı. Alanları şimdiden
              tanımlayabilirsiniz; ödeme sonrası otomatik lisans üretimi ileriki
              fazda devreye alınacak.
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input
                  type="checkbox"
                  checked={form.licenseRequired ?? false}
                  onChange={(e) =>
                    onChange('licenseRequired', e.target.checked)
                  }
                />
                Merkezi lisans gerekli
              </label>
              <div>
                <Label>Lisans uygulama kodu</Label>
                <Input
                  value={form.licenseAppCode ?? ''}
                  onChange={(e) =>
                    onChange('licenseAppCode', e.target.value || null)
                  }
                  placeholder="MUVEKKIL_KASA_DESKTOP"
                  className="font-mono text-sm"
                />
              </div>
              <div>
                <Label>Maks. cihaz</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.licenseMaxDevices ?? ''}
                  onChange={(e) =>
                    onChange(
                      'licenseMaxDevices',
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                />
              </div>
              <div>
                <Label>Lisans süresi (gün)</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.licenseDays ?? ''}
                  onChange={(e) =>
                    onChange(
                      'licenseDays',
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                />
              </div>
              <div>
                <Label>Abonelik süresi (ay)</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.licenseMonths ?? ''}
                  onChange={(e) =>
                    onChange(
                      'licenseMonths',
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                />
              </div>
            </div>
          </FormSection>
        ) : null}
      </>
    );
  }

  if (deliveryMode === 'SAAS') {
    return (
      <FormSection
        title="SaaS / Abonelik"
        description="Web tabanlı abonelik ürün ayarları"
      >
        <div className="mb-3 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-900">
          SaaS hesap oluşturma (provisioning) sonraki fazda uygulanacak. Şimdilik
          ürün tanım alanlarını doldurun.
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>SaaS uygulama kodu</Label>
            <Input
              value={form.saasAppCode ?? ''}
              onChange={(e) =>
                onChange('saasAppCode', e.target.value || null)
              }
              placeholder="MUVEKKIL_KASA_SAAS"
              className="font-mono text-sm"
            />
          </div>
          <div>
            <Label>Plan kodu</Label>
            <Input
              value={form.saasPlanCode ?? ''}
              onChange={(e) =>
                onChange('saasPlanCode', e.target.value || null)
              }
            />
          </div>
          <div>
            <Label>Deneme süresi (gün)</Label>
            <Input
              type="number"
              min={0}
              value={form.saasTrialDays ?? ''}
              onChange={(e) =>
                onChange(
                  'saasTrialDays',
                  e.target.value ? Number(e.target.value) : null,
                )
              }
            />
          </div>
          <div>
            <Label>Abonelik süresi (ay)</Label>
            <Input
              type="number"
              min={1}
              value={form.licenseMonths ?? ''}
              onChange={(e) =>
                onChange(
                  'licenseMonths',
                  e.target.value ? Number(e.target.value) : null,
                )
              }
            />
          </div>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={form.saasRequiresLogin ?? false}
              onChange={(e) =>
                onChange('saasRequiresLogin', e.target.checked)
              }
            />
            Satın alma için müşteri girişi zorunlu
          </label>
        </div>
      </FormSection>
    );
  }

  return (
    <FormSection title="Teslimat" description="Bu ürün tipi için teslimat tanımı yok">
      <p className="text-sm text-[rgb(var(--admin-text-muted))]">
        Fiziksel ürünler için stok ve kargo ayarlarını fiyat sekmesinden
        yönetebilirsiniz.
      </p>
    </FormSection>
  );
}
