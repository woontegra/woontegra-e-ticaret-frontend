export const USER_ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'EDITOR',
  'STAFF',
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Süper Admin',
  ADMIN: 'Admin',
  EDITOR: 'Editör',
  STAFF: 'Personel',
};

export const ROLE_GROUPS = {
  settings: ['SUPER_ADMIN', 'ADMIN'],
  content: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'],
  operations: ['SUPER_ADMIN', 'ADMIN', 'STAFF'],
  panel: ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'STAFF'],
  userManagers: ['SUPER_ADMIN', 'ADMIN'],
  auditViewers: ['SUPER_ADMIN', 'ADMIN'],
} as const satisfies Record<string, readonly UserRole[]>;

export function canManageUsers(role?: string | null): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN';
}

export function canViewUsers(role?: string | null): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN';
}

export function assignableRoles(actorRole?: string | null): UserRole[] {
  if (actorRole === 'SUPER_ADMIN') return [...USER_ROLES];
  if (actorRole === 'ADMIN') return ['ADMIN', 'EDITOR', 'STAFF'];
  return [];
}

export const AUDIT_ACTION_LABELS: Record<string, string> = {
  USER_LOGIN: 'Kullanıcı girişi',
  PRODUCT_CREATE: 'Ürün oluşturma',
  PRODUCT_UPDATE: 'Ürün güncelleme',
  PRODUCT_DELETE: 'Ürün silme',
  PAGE_PUBLISH: 'Sayfa yayınlama',
  PAGE_UNPUBLISH: 'Sayfa yayından kaldırma',
  BLOG_PUBLISH: 'Blog yayınlama',
  BLOG_UNPUBLISH: 'Blog yayından kaldırma',
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
  catalog: 'Katalog',
  pages: 'Sayfalar',
  blog: 'Blog',
  theme: 'Tema',
  settings: 'Ayarlar',
  commerce: 'Siparişler',
  mail: 'Mail',
  payment: 'Ödeme',
  shipping: 'Kargo',
};
