import { Navigate } from 'react-router-dom';
import { useAuthStore } from './auth.store';

interface RequireRoleProps {
  roles: string[];
  children: React.ReactNode;
}

export function RequireRole({ roles, children }: RequireRoleProps) {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/admin/unauthorized" replace />;
  }

  return children;
}
