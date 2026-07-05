import type { LucideIcon } from 'lucide-react';
import type { UserRole } from '@/shared/auth/roles';
import {
  BarChart3,
  CreditCard,
  FileText,
  Globe,
  Image,
  LayoutDashboard,
  LayoutTemplate,
  Layers,
  MessageSquare,
  Package,
  Palette,
  FolderTree,
  Tag,
  SlidersHorizontal,
  PanelBottom,
  ShoppingCart,
  Truck,
  UserCog,
  Mail,
  Menu,
  Newspaper,
  Megaphone,
  History,
  Search,
  Ticket,
} from 'lucide-react';

export interface AdminNavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  end?: boolean;
  roles?: UserRole[];
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

export const adminNavigation: AdminNavGroup[] = [
  {
    label: 'Dashboard',
    items: [
      {
        label: 'Özet',
        path: '/admin',
        icon: LayoutDashboard,
        end: true,
        roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'STAFF'],
      },
      {
        label: 'Raporlar',
        path: '/admin/reports',
        icon: BarChart3,
        roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'STAFF'],
      },
    ],
  },
  {
    label: 'Operasyon',
    items: [
      { label: 'Siparişler', path: '/admin/orders', icon: ShoppingCart, roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'STAFF'] },
      { label: 'Kargo', path: '/admin/shipping', icon: Truck, roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'] },
      { label: 'Yorumlar', path: '/admin/reviews', icon: MessageSquare, roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'STAFF'] },
      { label: 'İletişim', path: '/admin/contact', icon: Mail, roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'STAFF'] },
    ],
  },
  {
    label: 'Katalog',
    items: [
      { label: 'Ürünler / Yazılımlar', path: '/admin/products', icon: Package, roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'STAFF'] },
      { label: 'Kategoriler', path: '/admin/products/categories', icon: FolderTree, roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'] },
      { label: 'Markalar', path: '/admin/products/brands', icon: Tag, roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'] },
      { label: 'Özellikler', path: '/admin/products/attributes', icon: SlidersHorizontal, roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'] },
      { label: 'Varyantlar', path: '/admin/products/variants', icon: Layers, roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'STAFF'] },
    ],
  },
  {
    label: 'İçerik',
    items: [
      { label: 'Sayfalar', path: '/admin/content/pages', icon: FileText, roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'] },
      { label: 'Blog', path: '/admin/content/blog/posts', icon: Newspaper, roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'] },
      { label: 'Medya', path: '/admin/media', icon: Image, roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'] },
      { label: 'Menü', path: '/admin/content/menus', icon: Menu, roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'] },
      { label: 'Footer', path: '/admin/theme/footer', icon: PanelBottom, roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'] },
    ],
  },
  {
    label: 'Tasarım',
    items: [
      { label: 'Tema Ayarları', path: '/admin/theme/settings', icon: Palette, roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'] },
      { label: 'Header', path: '/admin/theme/header', icon: LayoutTemplate, roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'] },
      { label: 'Builder', path: '/admin/theme/builder', icon: LayoutTemplate, roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'] },
    ],
  },
  {
    label: 'Pazarlama',
    items: [
      { label: 'Kampanyalar', path: '/admin/promotions/campaigns', icon: Megaphone, roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'] },
      { label: 'Kuponlar', path: '/admin/promotions/coupons', icon: Ticket, roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'] },
      { label: 'SEO', path: '/admin/seo', icon: Search, roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'] },
    ],
  },
  {
    label: 'Sistem',
    items: [
      { label: 'Kullanıcılar', path: '/admin/users', icon: UserCog, roles: ['SUPER_ADMIN', 'ADMIN'] },
      { label: 'Mail', path: '/admin/settings/mail', icon: Mail, roles: ['SUPER_ADMIN', 'ADMIN'] },
      { label: 'Ödeme', path: '/admin/payments', icon: CreditCard, roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'] },
      { label: 'Ayarlar', path: '/admin/settings/site', icon: Globe, roles: ['SUPER_ADMIN', 'ADMIN'] },
      { label: 'İşlem Geçmişi', path: '/admin/audit-logs', icon: History, roles: ['SUPER_ADMIN', 'ADMIN'] },
    ],
  },
];

export const adminNavItems = adminNavigation.flatMap((group) => group.items);

export function getAdminPageTitle(pathname: string): string {
  if (pathname.startsWith('/admin/settings/company')) return 'Firma / İletişim';
  if (pathname.match(/^\/admin\/settings\/mail\/templates\/[^/]+$/))
    return 'Mail şablonu düzenle';
  if (pathname.startsWith('/admin/settings/mail/templates'))
    return 'Mail şablonları';
  if (pathname.startsWith('/admin/settings/mail')) return 'Mail ayarları';
  if (pathname.startsWith('/admin/settings/site')) return 'Site ayarları';
  if (pathname.startsWith('/admin/content/pages/new')) return 'Yeni sayfa';
  if (pathname.match(/^\/admin\/content\/pages\/[^/]+$/)) return 'Sayfa düzenle';
  if (pathname.startsWith('/admin/content/pages')) return 'Sayfalar';
  if (pathname.startsWith('/admin/content/blog/posts/new')) return 'Yeni blog yazısı';
  if (pathname.match(/^\/admin\/content\/blog\/posts\/[^/]+$/))
    return 'Blog yazısı düzenle';
  if (pathname.startsWith('/admin/content/blog/posts')) return 'Blog yazıları';
  if (pathname.startsWith('/admin/content/blog/categories')) return 'Blog kategorileri';
  if (pathname.startsWith('/admin/content/menus')) return 'Menü yönetimi';
  if (pathname.startsWith('/admin/theme/builder')) return 'Sayfa builder';
  if (pathname.startsWith('/admin/theme/footer')) return 'Footer yönetimi';
  if (pathname.startsWith('/admin/theme/header')) return 'Header ayarları';
  if (pathname.startsWith('/admin/theme/settings')) return 'Tema ayarları';
  if (pathname.startsWith('/admin/theme')) return 'Tasarım';

  if (pathname.startsWith('/admin/products/categories/new')) return 'Yeni kategori';
  if (pathname.match(/^\/admin\/products\/categories\/[^/]+$/)) return 'Kategori düzenle';
  if (pathname.startsWith('/admin/products/categories')) return 'Kategoriler';
  if (pathname.startsWith('/admin/products/brands/new')) return 'Yeni marka';
  if (pathname.match(/^\/admin\/products\/brands\/[^/]+$/)) return 'Marka düzenle';
  if (pathname.startsWith('/admin/products/brands')) return 'Markalar';
  if (pathname.startsWith('/admin/products/attributes/new')) return 'Yeni özellik';
  if (pathname.match(/^\/admin\/products\/attributes\/[^/]+$/)) return 'Özellik düzenle';
  if (pathname.startsWith('/admin/products/attributes')) return 'Özellikler';
  if (pathname.startsWith('/admin/products/variants')) return 'Varyantlar';
  if (pathname.startsWith('/admin/products/new')) return 'Yeni ürün';
  if (pathname.match(/^\/admin\/products\/[^/]+\/edit$/)) return 'Ürün düzenle';
  if (pathname.match(/^\/admin\/products\/[^/]+$/)) return 'Ürün düzenle';
  if (pathname.startsWith('/admin/products')) return 'Ürünler / Yazılımlar';

  if (pathname.startsWith('/admin/shipping/methods')) return 'Kargo yöntemleri';
  if (pathname.startsWith('/admin/shipping/carriers')) return 'Kargo firmaları';
  if (pathname.startsWith('/admin/shipping')) return 'Kargo';

  if (pathname.startsWith('/admin/audit-logs')) return 'İşlem geçmişi';

  if (pathname.startsWith('/admin/notifications')) return 'Bildirimler';

  if (pathname.startsWith('/admin/reports')) return 'Raporlar';

  if (pathname.startsWith('/admin/contact/forms')) return 'Form yönetimi';
  if (pathname.startsWith('/admin/contact')) return 'İletişim mesajları';

  if (pathname.startsWith('/admin/promotions/campaigns/new')) return 'Yeni kampanya';
  if (pathname.match(/^\/admin\/promotions\/campaigns\/[^/]+\/edit$/)) return 'Kampanya düzenle';
  if (pathname.startsWith('/admin/promotions/campaigns')) return 'Kampanyalar';
  if (pathname.startsWith('/admin/promotions/coupons/new')) return 'Yeni kupon';
  if (pathname.match(/^\/admin\/promotions\/coupons\/[^/]+\/edit$/)) return 'Kupon düzenle';
  if (pathname.startsWith('/admin/promotions/coupons')) return 'Kuponlar';
  if (pathname.startsWith('/admin/promotions')) return 'Kampanyalar';

  if (pathname.startsWith('/admin/seo/redirects')) return 'SEO yönlendirmeleri';
  if (pathname.startsWith('/admin/seo')) return 'SEO ayarları';

  if (pathname.startsWith('/admin/reviews')) return 'Ürün yorumları';

  if (pathname.startsWith('/admin/payments')) return 'Ödeme ayarları';

  const item = adminNavItems.find((nav) =>
    nav.end ? pathname === nav.path : pathname.startsWith(nav.path),
  );
  return item?.label ?? 'Admin';
}
