import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/shared/api/client';
import {
  createBrand,
  getBrand,
  slugifyClient,
  updateBrand,
} from '@/shared/api/products.api';
import {
  AdminFormLayout,
  FormSection,
  StickyFormActions,
} from '@/admin/components/ui';
import { useAdminMutationFeedback } from '@/admin/hooks/useAdminMutationFeedback';
import { Input, Label, MediaField, Textarea } from '@/shared/ui';

export function BrandEditPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { onSuccess, onError } = useAdminMutationFeedback();

  const [form, setForm] = useState({
    name: '',
    slug: '',
    logoId: null as string | null,
    description: '',
    seoTitle: '',
    seoDescription: '',
    isActive: true,
  });
  const [slugTouched, setSlugTouched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const brandQuery = useQuery({
    queryKey: ['admin', 'brands', id],
    queryFn: () => getBrand(id!),
    enabled: !isNew && Boolean(id),
  });

  useEffect(() => {
    const brand = brandQuery.data;
    if (brand) {
      setForm({
        name: brand.name,
        slug: brand.slug,
        logoId: brand.logoId,
        description: brand.description ?? '',
        seoTitle: brand.seoTitle ?? '',
        seoDescription: brand.seoDescription ?? '',
        isActive: brand.isActive,
      });
      setSlugTouched(true);
    }
  }, [brandQuery.data]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'brands'] });
    queryClient.invalidateQueries({ queryKey: ['public', 'brands'] });
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        name: form.name,
        slug: form.slug,
        logoId: form.logoId,
        description: form.description || null,
        seoTitle: form.seoTitle || null,
        seoDescription: form.seoDescription || null,
        isActive: form.isActive,
      };
      return isNew ? createBrand(payload) : updateBrand(id!, payload);
    },
    onSuccess: () => {
      invalidate();
      onSuccess(isNew ? 'Marka oluşturuldu.' : 'Marka güncellendi.');
      navigate('/admin/products/brands');
    },
    onError: (error) => {
      const message =
        error instanceof ApiError ? error.message : 'Kayıt başarısız';
      setErrorMessage(message);
      onError(error, message);
    },
  });

  return (
    <AdminFormLayout
      title={isNew ? 'Yeni Marka' : 'Marka Düzenle'}
      description="Marka bilgilerini ve görsel kimliğini yönetin"
      backTo="/admin/products/brands"
      backLabel="Markalar"
    >
      <FormSection title="Temel Bilgiler">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Ad</Label>
            <Input
              value={form.name}
              onChange={(event) => {
                const name = event.target.value;
                setForm((prev) => ({
                  ...prev,
                  name,
                  slug: slugTouched ? prev.slug : slugifyClient(name),
                }));
              }}
            />
          </div>
          <div>
            <Label>Slug</Label>
            <Input
              value={form.slug}
              onChange={(event) => {
                setSlugTouched(true);
                setForm((prev) => ({
                  ...prev,
                  slug: slugifyClient(event.target.value),
                }));
              }}
            />
          </div>
        </div>
        <div>
          <Label>Açıklama</Label>
          <Textarea
            rows={3}
            value={form.description}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, description: event.target.value }))
            }
          />
        </div>
        <MediaField
          label="Logo"
          value={form.logoId}
          onChange={(value) => setForm((prev) => ({ ...prev, logoId: value }))}
          folder="products"
        />
        <label className="flex items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, isActive: event.target.checked }))
            }
          />
          <span className="font-medium">Marka aktif</span>
        </label>
      </FormSection>

      <FormSection title="SEO">
        <div>
          <Label>SEO başlık</Label>
          <Input
            value={form.seoTitle}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, seoTitle: event.target.value }))
            }
          />
        </div>
        <div>
          <Label>SEO açıklama</Label>
          <Textarea
            rows={2}
            value={form.seoDescription}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                seoDescription: event.target.value,
              }))
            }
          />
        </div>
      </FormSection>

      {errorMessage ? (
        <p className="text-sm text-red-600">{errorMessage}</p>
      ) : null}

      <StickyFormActions
        onCancel={() => navigate('/admin/products/brands')}
        onSave={() => saveMutation.mutate()}
        isSaving={saveMutation.isPending}
      />
    </AdminFormLayout>
  );
}
