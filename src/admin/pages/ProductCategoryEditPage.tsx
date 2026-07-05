import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/shared/api/client';
import {
  createProductCategory,
  getProductCategory,
  listProductCategories,
  slugifyClient,
  updateProductCategory,
} from '@/shared/api/products.api';
import {
  AdminFormLayout,
  FormSection,
  StickyFormActions,
} from '@/admin/components/ui';
import { useAdminMutationFeedback } from '@/admin/hooks/useAdminMutationFeedback';
import { Input, Label, MediaField, Select, Textarea } from '@/shared/ui';

export function ProductCategoryEditPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { onSuccess, onError } = useAdminMutationFeedback();

  const [form, setForm] = useState({
    parentId: '',
    name: '',
    slug: '',
    description: '',
    imageId: null as string | null,
    bannerImageId: null as string | null,
    seoTitle: '',
    seoDescription: '',
    sortOrder: 0,
    isActive: true,
  });
  const [slugTouched, setSlugTouched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const categoryQuery = useQuery({
    queryKey: ['admin', 'product-categories', id],
    queryFn: () => getProductCategory(id!),
    enabled: !isNew && Boolean(id),
  });

  const parentOptionsQuery = useQuery({
    queryKey: ['admin', 'product-categories', 'options'],
    queryFn: () => listProductCategories({ limit: 200 }),
    select: (data) => data.items,
  });

  useEffect(() => {
    const category = categoryQuery.data;
    if (category) {
      setForm({
        parentId: category.parentId ?? '',
        name: category.name,
        slug: category.slug,
        description: category.description ?? '',
        imageId: category.imageId,
        bannerImageId: category.bannerImageId,
        seoTitle: category.seoTitle ?? '',
        seoDescription: category.seoDescription ?? '',
        sortOrder: category.sortOrder,
        isActive: category.isActive,
      });
      setSlugTouched(true);
    }
  }, [categoryQuery.data]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'product-categories'] });
    queryClient.invalidateQueries({ queryKey: ['public', 'categories'] });
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        parentId: form.parentId || null,
        name: form.name,
        slug: form.slug,
        description: form.description || null,
        imageId: form.imageId,
        bannerImageId: form.bannerImageId,
        seoTitle: form.seoTitle || null,
        seoDescription: form.seoDescription || null,
        sortOrder: form.sortOrder,
        isActive: form.isActive,
      };
      return isNew
        ? createProductCategory(payload)
        : updateProductCategory(id!, payload);
    },
    onSuccess: () => {
      invalidate();
      onSuccess(isNew ? 'Kategori oluşturuldu.' : 'Kategori güncellendi.');
      navigate('/admin/products/categories');
    },
    onError: (error) => {
      const message =
        error instanceof ApiError ? error.message : 'Kayıt başarısız';
      setErrorMessage(message);
      onError(error, message);
    },
  });

  const parentOptions = parentOptionsQuery.data ?? [];

  return (
    <AdminFormLayout
      title={isNew ? 'Yeni Kategori' : 'Kategori Düzenle'}
      description="Ürün kategorilerini ve hiyerarşisini yönetin"
      backTo="/admin/products/categories"
      backLabel="Kategoriler"
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
          <div>
            <Label>Üst kategori</Label>
            <Select
              value={form.parentId}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, parentId: event.target.value }))
              }
            >
              <option value="">Yok</option>
              {parentOptions
                .filter((category) => category.id !== id)
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </Select>
          </div>
          <div>
            <Label>Sıra</Label>
            <Input
              type="number"
              value={form.sortOrder}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  sortOrder: Number(event.target.value),
                }))
              }
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
        <div className="grid gap-4 sm:grid-cols-2">
          <MediaField
            label="Görsel"
            value={form.imageId}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, imageId: value }))
            }
            folder="products"
          />
          <MediaField
            label="Banner görseli"
            value={form.bannerImageId}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, bannerImageId: value }))
            }
            folder="products"
          />
        </div>
        <label className="flex items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, isActive: event.target.checked }))
            }
          />
          <span className="font-medium">Kategori aktif</span>
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
        onCancel={() => navigate('/admin/products/categories')}
        onSave={() => saveMutation.mutate()}
        isSaving={saveMutation.isPending}
      />
    </AdminFormLayout>
  );
}
