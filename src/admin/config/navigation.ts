import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Building2,
  CreditCard,
  FileText,
  Globe,
  Image,
  LayoutDashboard,
  MessageSquare,
  Package,
  Palette,
  ShoppingCart,
  Truck,
  UserCog,
  Users,
  Mail,
  Menu,
  Newspaper,
  Tags,
} from 'lucide-react';

export interface AdminNavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  end?: boolean;
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

export const adminNavigation: AdminNavGroup[] = [
  {
    label: 'Genel',
    items: [
      {
        label: 'Dashboard',
        path: '/admin',
        icon: LayoutDashboard,
        end: true,
      },
    ],
  },
  {
    label: 'Satış',
    items: [
      { label: 'Ürünler / Yazılımlar', path: '/admin/products', icon: Package },
      { label: 'Siparişler', path: '/admin/orders', icon: ShoppingCart },
      { label: 'Müşteriler', path: '/admin/customers', icon: Users },
    ],
  },
  {
    label: 'İçerik',
    items: [
      { label: 'Sayfalar', path: '/admin/content/pages', icon: FileText },
      { label: 'Blog Yazıları', path: '/admin/content/blog/posts', icon: Newspaper },
      { label: 'Blog Kategorileri', path: '/admin/content/blog/categories', icon: Tags },
      { label: 'Menü Yönetimi', path: '/admin/content/menus', icon: Menu },
      { label: 'Medya', path: '/admin/media', icon: Image },
      { label: 'Tema & Tasarım', path: '/admin/theme/settings', icon: Palette },
    ],
  },
  {
    label: 'Operasyon',
    items: [
      { label: 'Kargo', path: '/admin/shipping', icon: Truck },
      { label: 'Ödeme', path: '/admin/payments', icon: CreditCard },
      { label: 'Yorumlar', path: '/admin/reviews', icon: MessageSquare },
      { label: 'İletişim', path: '/admin/contact', icon: Mail },
    ],
  },
  {
    label: 'Sistem',
    items: [
      { label: 'Kullanıcılar', path: '/admin/users', icon: UserCog },
      { label: 'Site Bilgileri', path: '/admin/settings/site', icon: Globe },
      { label: 'Firma / İletişim', path: '/admin/settings/company', icon: Building2 },
      { label: 'Raporlar', path: '/admin/reports', icon: BarChart3 },
    ],
  },
];

export const adminNavItems = adminNavigation.flatMap((group) => group.items);

export function getAdminPageTitle(pathname: string): string {
  if (pathname.startsWith('/admin/settings/site')) return 'Site Bilgileri';
  if (pathname.startsWith('/admin/settings/company')) return 'Firma / İletişim';
  if (pathname.startsWith('/admin/content/pages/new')) return 'Yeni sayfa';
  if (pathname.match(/^\/admin\/content\/pages\/[^/]+$/)) return 'Sayfa düzenle';
  if (pathname.startsWith('/admin/content/pages')) return 'Sayfalar';
  if (pathname.startsWith('/admin/content/blog/posts/new')) return 'Yeni blog yazısı';
  if (pathname.match(/^\/admin\/content\/blog\/posts\/[^/]+$/)) return 'Blog yazısı düzenle';
  if (pathname.startsWith('/admin/content/blog/posts')) return 'Blog Yazıları';
  if (pathname.startsWith('/admin/content/blog/categories')) return 'Blog Kategorileri';
  if (pathname.startsWith('/admin/content/menus')) return 'Menü Yönetimi';
  if (pathname.startsWith('/admin/theme/builder')) return 'Sayfa Builder';
  if (pathname.startsWith('/admin/theme/footer')) return 'Footer Yönetimi';
  if (pathname.startsWith('/admin/theme/header')) return 'Header Ayarları';
  if (pathname.startsWith('/admin/theme/settings')) return 'Tema Ayarları';
  if (pathname.startsWith('/admin/theme')) return 'Tema & Tasarım';

  if (pathname.startsWith('/admin/products/categories')) return 'Ürün Kategorileri';
  if (pathname.startsWith('/admin/products/brands')) return 'Markalar';
  if (pathname.startsWith('/admin/products/new')) return 'Yeni ürün';
  if (pathname.match(/^\/admin\/products\/[^/]+$/)) return 'Ürün düzenle';
  if (pathname.startsWith('/admin/products')) return 'Ürünler / Yazılımlar';

  const item = adminNavItems.find((nav) =>
    nav.end ? pathname === nav.path : pathname.startsWith(nav.path),
  );
  return item?.label ?? 'Admin';
}
