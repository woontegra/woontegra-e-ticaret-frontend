import { useHasRole, type UserRole } from './roles';

interface CanAccessProps {
  roles: readonly UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function CanAccess({ roles, children, fallback = null }: CanAccessProps) {
  const allowed = useHasRole(roles);
  if (!allowed) return fallback;
  return children;
}
