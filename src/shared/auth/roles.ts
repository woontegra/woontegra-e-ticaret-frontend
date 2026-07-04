export const USER_ROLES = [
  'SUPER_ADMIN',
  'OWNER',
  'ADMIN',
  'STAFF',
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Süper Admin',
  OWNER: 'Mağaza Sahibi',
  ADMIN: 'Admin',
  STAFF: 'Personel',
};

export function canManageUsers(role?: string | null): boolean {
  return role === 'SUPER_ADMIN' || role === 'OWNER';
}

export function canViewUsers(role?: string | null): boolean {
  return role === 'SUPER_ADMIN' || role === 'OWNER' || role === 'ADMIN';
}

export function assignableRoles(actorRole?: string | null): UserRole[] {
  if (actorRole === 'SUPER_ADMIN') return [...USER_ROLES];
  if (actorRole === 'OWNER') return ['ADMIN', 'STAFF'];
  return [];
}
