import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { FooterLinkDto, MenuItemType } from '@/shared/types/api';
import { listBlogCategories, listBlogPosts } from '@/shared/api/blog.api';
import { FOOTER_LINK_TYPE_LABELS } from '@/shared/api/footer.api';
import { listPages } from '@/shared/api/pages.api';
import { Button, Input, Label, Modal, Select } from '@/shared/ui';

export interface FooterLinkFormValues {
  label: string;
  type: MenuItemType;
  targetId: string;
  url: string;
  openInNewTab: boolean;
  isActive: boolean;
}

interface FooterLinkFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  initial?: FooterLinkDto | null;
  onSubmit: (values: FooterLinkFormValues) => void;
  isLoading?: boolean;
}

const emptyValues = (): FooterLinkFormValues => ({
  label: '',
  type: 'CUSTOM_URL',
  targetId: '',
  url: '/',
  openInNewTab: false,
  isActive: true,
});

export function FooterLinkFormModal({
  isOpen,
  onClose,
  title,
  initial,
  onSubmit,
  isLoading,
}: FooterLinkFormModalProps) {
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
          <Button isLoading={isLoading} onClick={() => onSubmit(form)}>
            Kaydet
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div>
          <Label htmlFor="footer-link-label" required>
            Etiket
          </Label>
          <Input
            id="footer-link-label"
            value={form.label}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, label: event.target.value }))
            }
          />
        </div>

        <div>
          <Label htmlFor="footer-link-type">Tür</Label>
          <Select
            id="footer-link-type"
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
            {Object.entries(FOOTER_LINK_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>

        {form.type === 'PAGE' ? (
          <div>
            <Label htmlFor="footer-link-page">Sayfa</Label>
            <Select
              id="footer-link-page"
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
            <Label htmlFor="footer-link-blog">Blog yazısı</Label>
            <Select
              id="footer-link-blog"
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
            <Label htmlFor="footer-link-category">Kategori</Label>
            <Select
              id="footer-link-category"
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
            <Label htmlFor="footer-link-product">Ürün ID</Label>
            <Input
              id="footer-link-product"
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
            <Label htmlFor="footer-link-url">URL</Label>
            <Input
              id="footer-link-url"
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
