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
      { label: 'Ürünler', path: '/admin/products', icon: Package },
      { label: 'Siparişler', path: '/admin/orders', icon: ShoppingCart },
      { label: 'Müşteriler', path: '/admin/customers', icon: Users },
    ],
  },
  {
    label: 'İçerik',
    items: [
      { label: 'İçerik Yönetimi', path: '/admin/content', icon: FileText },
      { label: 'Medya', path: '/admin/media', icon: Image },
      { label: 'Tema & Tasarım', path: '/admin/theme', icon: Palette },
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

  const item = adminNavItems.find((nav) =>
    nav.end ? pathname === nav.path : pathname.startsWith(nav.path),
  );
  return item?.label ?? 'Admin';
}
