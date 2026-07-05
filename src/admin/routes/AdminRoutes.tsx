import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/shared/auth/ProtectedRoute';
import { RequireRole } from '@/shared/auth/RequireRole';
import { AdminLayout } from '@/admin/layout/AdminLayout';
import { DashboardPage } from '@/admin/pages/DashboardPage';
import { LoginPage } from '@/admin/pages/LoginPage';
import { BlogCategoriesPage } from '@/admin/pages/BlogCategoriesPage';
import { BlogPostEditPage } from '@/admin/pages/BlogPostEditPage';
import { BlogPostsListPage } from '@/admin/pages/BlogPostsListPage';
import { MenuManagementPage } from '@/admin/pages/MenuManagementPage';
import { MediaPage } from '@/admin/pages/MediaPage';
import { ModulePlaceholderPage } from '@/admin/pages/ModulePlaceholderPage';
import { OrdersListPage } from '@/admin/pages/OrdersListPage';
import { OrderDetailPage } from '@/admin/pages/OrderDetailPage';
import { PageEditPage } from '@/admin/pages/PageEditPage';
import { PagesListPage } from '@/admin/pages/PagesListPage';
import { SettingsLayout } from '@/admin/layout/SettingsLayout';
import { ThemeLayout } from '@/admin/layout/ThemeLayout';
import { HeaderSettingsPage } from '@/admin/pages/HeaderSettingsPage';
import { FooterManagementPage } from '@/admin/pages/FooterManagementPage';
import { ThemeSettingsPage } from '@/admin/pages/ThemeSettingsPage';
import { PageBuilderPage } from '@/admin/pages/PageBuilderPage';
import { ProductEditPage } from '@/admin/pages/ProductEditPage';
import { ProductCategoriesPage } from '@/admin/pages/ProductCategoriesPage';
import { ProductsListPage } from '@/admin/pages/ProductsListPage';
import { BrandsPage } from '@/admin/pages/BrandsPage';
import { ProductAttributesPage } from '@/admin/pages/ProductAttributesPage';
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
              <ProductsListPage />
            </RequireRole>
          }
        />
        <Route
          path="products/categories"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'OWNER', 'ADMIN']}>
              <ProductCategoriesPage />
            </RequireRole>
          }
        />
        <Route
          path="products/brands"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'OWNER', 'ADMIN']}>
              <BrandsPage />
            </RequireRole>
          }
        />
        <Route
          path="products/attributes"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'OWNER', 'ADMIN']}>
              <ProductAttributesPage />
            </RequireRole>
          }
        />
        <Route
          path="products/:id"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'OWNER', 'ADMIN', 'STAFF']}>
              <ProductEditPage />
            </RequireRole>
          }
        />
        <Route
          path="orders"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'OWNER', 'ADMIN', 'STAFF']}>
              <OrdersListPage />
            </RequireRole>
          }
        />
        <Route
          path="orders/:id"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'OWNER', 'ADMIN', 'STAFF']}>
              <OrderDetailPage />
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
          element={<Navigate to="/admin/content/pages" replace />}
        />
        <Route
          path="content/pages"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'OWNER', 'ADMIN']}>
              <PagesListPage />
            </RequireRole>
          }
        />
        <Route
          path="content/pages/:id"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'OWNER', 'ADMIN']}>
              <PageEditPage />
            </RequireRole>
          }
        />
        <Route
          path="content/blog/posts"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'OWNER', 'ADMIN']}>
              <BlogPostsListPage />
            </RequireRole>
          }
        />
        <Route
          path="content/blog/posts/:id"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'OWNER', 'ADMIN']}>
              <BlogPostEditPage />
            </RequireRole>
          }
        />
        <Route
          path="content/blog/categories"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'OWNER', 'ADMIN']}>
              <BlogCategoriesPage />
            </RequireRole>
          }
        />
        <Route
          path="content/menus"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'OWNER', 'ADMIN']}>
              <MenuManagementPage />
            </RequireRole>
          }
        />
        <Route
          path="media"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'OWNER', 'ADMIN']}>
              <MediaPage />
            </RequireRole>
          }
        />
        <Route
          path="theme"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'OWNER', 'ADMIN']}>
              <ThemeLayout />
            </RequireRole>
          }
        >
          <Route index element={<Navigate to="settings" replace />} />
          <Route path="settings" element={<ThemeSettingsPage />} />
          <Route path="header" element={<HeaderSettingsPage />} />
          <Route path="footer" element={<FooterManagementPage />} />
          <Route path="builder" element={<PageBuilderPage />} />
        </Route>
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
