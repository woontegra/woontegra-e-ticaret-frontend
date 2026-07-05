import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { MenuItemDto, MenuItemType } from '@/shared/types/api';
import { listBlogCategories, listBlogPosts } from '@/shared/api/blog.api';
import { listPages } from '@/shared/api/pages.api';
import { MENU_ITEM_TYPE_LABELS } from '@/shared/api/menus.api';
import { Button, Input, Label, Modal, Select } from '@/shared/ui';

export interface MenuItemFormValues {
  label: string;
  type: MenuItemType;
  targetId: string;
  url: string;
  openInNewTab: boolean;
  isActive: boolean;
}

interface MenuItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  initial?: MenuItemDto | null;
  onSubmit: (values: MenuItemFormValues) => void;
  isLoading?: boolean;
}

const emptyValues = (): MenuItemFormValues => ({
  label: '',
  type: 'CUSTOM_URL',
  targetId: '',
  url: '/',
  openInNewTab: false,
  isActive: true,
});

export function MenuItemFormModal({
  isOpen,
  onClose,
  title,
  initial,
  onSubmit,
  isLoading,
}: MenuItemFormModalProps) {
  const [form, setForm] = useState(emptyValues());

  const pagesQuery = useQuery({
    queryKey: ['admin', 'pages', 'picker'],
    queryFn: () => listPages(),
    enabled: isOpen && form.type === 'PAGE',
  });

  const postsQuery = useQuery({
    queryKey: ['admin', 'blog', 'posts', 'picker'],
    queryFn: () => listBlogPosts({ status: 'PUBLISHED' }),
    enabled: isOpen && form.type === 'BLOG',
  });

  const categoriesQuery = useQuery({
    queryKey: ['admin', 'blog', 'categories', 'picker'],
    queryFn: listBlogCategories,
    enabled: isOpen && form.type === 'CATEGORY',
  });

  useEffect(() => {
    if (initial) {
      setForm({
        label: initial.label,
        type: initial.type,
        targetId: initial.targetId ?? '',
        url: initial.url ?? '',
        openInNewTab: initial.openInNewTab,
        isActive: initial.isActive,
      });
    } else {
      setForm(emptyValues());
    }
  }, [initial, isOpen]);

  const handleSubmit = () => {
    onSubmit(form);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            İptal
          </Button>
          <Button isLoading={isLoading} onClick={handleSubmit}>
            Kaydet
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div>
          <Label htmlFor="item-label" required>
            Etiket
          </Label>
          <Input
            id="item-label"
            value={form.label}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, label: event.target.value }))
            }
          />
        </div>

        <div>
          <Label htmlFor="item-type">Tür</Label>
          <Select
            id="item-type"
            value={form.type}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                type: event.target.value as MenuItemType,
                targetId: '',
                url: '',
              }))
            }
          >
            {Object.entries(MENU_ITEM_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>

        {form.type === 'PAGE' ? (
          <div>
            <Label htmlFor="item-page">Sayfa</Label>
            <Select
              id="item-page"
              value={form.targetId}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, targetId: event.target.value }))
              }
            >
              <option value="">Seçin</option>
              {(pagesQuery.data?.items ?? []).map((page) => (
                <option key={page.id} value={page.id}>
                  {page.title}
                </option>
              ))}
            </Select>
          </div>
        ) : null}

        {form.type === 'BLOG' ? (
          <div>
            <Label htmlFor="item-blog">Blog yazısı</Label>
            <Select
              id="item-blog"
              value={form.targetId}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, targetId: event.target.value }))
              }
            >
              <option value="">Seçin</option>
              {(postsQuery.data?.items ?? []).map((post) => (
                <option key={post.id} value={post.id}>
                  {post.title}
                </option>
              ))}
            </Select>
          </div>
        ) : null}

        {form.type === 'CATEGORY' ? (
          <div>
            <Label htmlFor="item-category">Kategori</Label>
            <Select
              id="item-category"
              value={form.targetId}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, targetId: event.target.value }))
              }
            >
              <option value="">Seçin</option>
              {(categoriesQuery.data ?? []).map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>
        ) : null}

        {form.type === 'PRODUCT' ? (
          <div>
            <Label htmlFor="item-product">Ürün ID</Label>
            <Input
              id="item-product"
              value={form.targetId}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, targetId: event.target.value }))
              }
              placeholder="Ürün modülü eklendiğinde seçici aktif olacak"
            />
          </div>
        ) : null}

        {form.type === 'CUSTOM_URL' ? (
          <div>
            <Label htmlFor="item-url">URL</Label>
            <Input
              id="item-url"
              value={form.url}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, url: event.target.value }))
              }
              placeholder="/blog veya https://..."
            />
          </div>
        ) : null}

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.openInNewTab}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                openInNewTab: event.target.checked,
              }))
            }
            className="rounded border-slate-300"
          />
          Yeni sekmede aç
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, isActive: event.target.checked }))
            }
            className="rounded border-slate-300"
          />
          Aktif
        </label>
      </div>
    </Modal>
  );
}
