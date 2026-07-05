import { useAuthStore } from './auth.store';

export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'EDITOR'
  | 'STAFF';

export const ROLE_SETTINGS: UserRole[] = ['SUPER_ADMIN', 'ADMIN'];
export const ROLE_CONTENT: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'EDITOR'];
export const ROLE_OPERATIONS: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'STAFF'];
export const ROLE_USER_MANAGERS: UserRole[] = ['SUPER_ADMIN', 'ADMIN'];
export const ROLE_AUDIT_VIEWERS: UserRole[] = ['SUPER_ADMIN', 'ADMIN'];

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Süper Admin',
  ADMIN: 'Admin',
  EDITOR: 'Editör',
  STAFF: 'Personel',
};

export function canManageUsers(role: string | undefined): boolean {
  return hasAnyRole(role, ROLE_USER_MANAGERS);
}

export function assignableRoles(actorRole?: string): UserRole[] {
  if (actorRole === 'SUPER_ADMIN') {
    return ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'STAFF'];
  }
  if (actorRole === 'ADMIN') {
    return ['ADMIN', 'EDITOR', 'STAFF'];
  }
  return [];
}

export const AUDIT_ACTION_LABELS: Record<string, string> = {
  USER_LOGIN: 'Giriş',
  PRODUCT_CREATE: 'Ürün oluşturma',
  PRODUCT_UPDATE: 'Ürün güncelleme',
  PRODUCT_DELETE: 'Ürün silme',
  PAGE_PUBLISH: 'Sayfa yayınlama',
  PAGE_UNPUBLISH: 'Sayfa taslağa alma',
  BLOG_PUBLISH: 'Blog yayınlama',
  BLOG_UNPUBLISH: 'Blog taslağa alma',
  THEME_UPDATE: 'Tema güncelleme',
  HEADER_UPDATE: 'Header güncelleme',
  SITE_SETTING_UPDATE: 'Site ayarı güncelleme',
  COMPANY_SETTING_UPDATE: 'Firma ayarı güncelleme',
  ORDER_STATUS_UPDATE: 'Sipariş durumu güncelleme',
  MAIL_SETTING_UPDATE: 'Mail ayarı güncelleme',
  PAYMENT_SETTING_UPDATE: 'Ödeme ayarı güncelleme',
  SHIPPING_SETTING_UPDATE: 'Kargo ayarı güncelleme',
};

export const AUDIT_MODULE_LABELS: Record<string, string> = {
  auth: 'Kimlik doğrulama',
  users: 'Kullanıcılar',
  products: 'Ürünler',
  pages: 'Sayfalar',
  blog: 'Blog',
  theme: 'Tema',
  header: 'Header',
  settings: 'Ayarlar',
  orders: 'Siparişler',
  mail: 'Mail',
  payment: 'Ödeme',
  shipping: 'Kargo',
};

export function hasAnyRole(
  role: string | undefined,
  allowed: readonly string[],
): boolean {
  if (!role) return false;
  return allowed.includes(role);
}

export function useUserRole(): UserRole | undefined {
  return useAuthStore((state) => state.user?.role as UserRole | undefined);
}

export function useHasRole(allowed: readonly UserRole[]): boolean {
  const role = useUserRole();
  return hasAnyRole(role, allowed);
}
