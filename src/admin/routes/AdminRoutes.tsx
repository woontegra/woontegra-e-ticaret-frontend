import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/shared/auth/ProtectedRoute';
import { RequireRole } from '@/shared/auth/RequireRole';
import { AdminLayout } from '@/admin/layout/AdminLayout';
import { DashboardPage } from '@/admin/pages/DashboardPage';
import { LoginPage } from '@/admin/pages/LoginPage';
import { ModulePlaceholderPage } from '@/admin/pages/ModulePlaceholderPage';
import { SettingsLayout } from '@/admin/layout/SettingsLayout';
import { CompanySettingsPage } from '@/admin/pages/CompanySettingsPage';
import { SiteSettingsPage } from '@/admin/pages/SiteSettingsPage';
import { UnauthorizedPage } from '@/admin/pages/UnauthorizedPage';
import { UsersPage } from '@/admin/pages/UsersPage';

export function AdminRoutes() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="unauthorized" element={<UnauthorizedPage />} />
        <Route
          path="users"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'OWNER', 'ADMIN']}>
              <UsersPage />
            </RequireRole>
          }
        />
        <Route
          path="products"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'OWNER', 'ADMIN', 'STAFF']}>
              <ModulePlaceholderPage title="Ürünler" />
            </RequireRole>
          }
        />
        <Route
          path="orders"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'OWNER', 'ADMIN', 'STAFF']}>
              <ModulePlaceholderPage title="Siparişler" />
            </RequireRole>
          }
        />
        <Route
          path="customers"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'OWNER', 'ADMIN', 'STAFF']}>
              <ModulePlaceholderPage title="Müşteriler" />
            </RequireRole>
          }
        />
        <Route
          path="content"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'OWNER', 'ADMIN']}>
              <ModulePlaceholderPage title="İçerik Yönetimi" />
            </RequireRole>
          }
        />
        <Route
          path="media"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'OWNER', 'ADMIN']}>
              <ModulePlaceholderPage title="Medya" />
            </RequireRole>
          }
        />
        <Route
          path="theme"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'OWNER', 'ADMIN']}>
              <ModulePlaceholderPage title="Tema & Tasarım" />
            </RequireRole>
          }
        />
        <Route
          path="shipping"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'OWNER', 'ADMIN']}>
              <ModulePlaceholderPage title="Kargo" />
            </RequireRole>
          }
        />
        <Route
          path="payments"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'OWNER', 'ADMIN']}>
              <ModulePlaceholderPage title="Ödeme" />
            </RequireRole>
          }
        />
        <Route
          path="reviews"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'OWNER', 'ADMIN', 'STAFF']}>
              <ModulePlaceholderPage title="Yorumlar" />
            </RequireRole>
          }
        />
        <Route
          path="contact"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'OWNER', 'ADMIN', 'STAFF']}>
              <ModulePlaceholderPage title="İletişim" />
            </RequireRole>
          }
        />
        <Route
          path="reports"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'OWNER', 'ADMIN']}>
              <ModulePlaceholderPage title="Raporlar" />
            </RequireRole>
          }
        />
        <Route
          path="settings"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'OWNER']}>
              <SettingsLayout />
            </RequireRole>
          }
        >
          <Route index element={<Navigate to="site" replace />} />
          <Route path="site" element={<SiteSettingsPage />} />
          <Route path="company" element={<CompanySettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
