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
import { ContactMessagesPage } from '@/admin/pages/ContactMessagesPage';
import { FormDefinitionsPage } from '@/admin/pages/FormDefinitionsPage';
import { ProductReviewsPage } from '@/admin/pages/ProductReviewsPage';
import { PaymentSettingsPage } from '@/admin/pages/PaymentSettingsPage';
import { ShippingCarriersPage } from '@/admin/pages/ShippingCarriersPage';
import { ShippingMethodsPage } from '@/admin/pages/ShippingMethodsPage';
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
import { MailSettingsPage } from '@/admin/pages/MailSettingsPage';
import { MailTemplateEditPage } from '@/admin/pages/MailTemplateEditPage';
import { MailTemplatesPage } from '@/admin/pages/MailTemplatesPage';
import { SeoSettingsPage } from '@/admin/pages/SeoSettingsPage';
import { RedirectRulesPage } from '@/admin/pages/RedirectRulesPage';
import { SeoLayout } from '@/admin/layout/SeoLayout';
import { CampaignsPage } from '@/admin/pages/CampaignsPage';
import { CouponsPage } from '@/admin/pages/CouponsPage';
import { PromotionLayout } from '@/admin/layout/PromotionLayout';
import { CampaignEditPage } from '@/admin/pages/CampaignEditPage';
import { CouponEditPage } from '@/admin/pages/CouponEditPage';
import { BrandEditPage } from '@/admin/pages/BrandEditPage';
import { ProductCategoryEditPage } from '@/admin/pages/ProductCategoryEditPage';
import { ProductAttributeEditPage } from '@/admin/pages/ProductAttributeEditPage';
import { ProductVariantsPage } from '@/admin/pages/ProductVariantsPage';
import { SiteSettingsPage } from '@/admin/pages/SiteSettingsPage';
import { UnauthorizedPage } from '@/admin/pages/UnauthorizedPage';
import { UsersPage } from '@/admin/pages/UsersPage';
import { NotificationsPage } from '@/admin/pages/NotificationsPage';
import { AuditLogsPage } from '@/admin/pages/AuditLogsPage';
import { ReportsPage } from '@/admin/pages/ReportsPage';
import { ModulePlaceholderPage } from '@/admin/pages/ModulePlaceholderPage';

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
        <Route
          path="notifications"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'STAFF']}>
              <NotificationsPage />
            </RequireRole>
          }
        />
        <Route path="unauthorized" element={<UnauthorizedPage />} />
        <Route
          path="users"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'ADMIN']}>
              <UsersPage />
            </RequireRole>
          }
        />
        <Route
          path="audit-logs"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'ADMIN']}>
              <AuditLogsPage />
            </RequireRole>
          }
        />
        <Route
          path="products/categories/new"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'ADMIN', 'EDITOR']}>
              <ProductCategoryEditPage />
            </RequireRole>
          }
        />
        <Route
          path="products/categories/:id"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'ADMIN', 'EDITOR']}>
              <ProductCategoryEditPage />
            </RequireRole>
          }
        />
        <Route
          path="products/categories"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'ADMIN', 'EDITOR']}>
              <ProductCategoriesPage />
            </RequireRole>
          }
        />
        <Route
          path="products/brands/new"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'ADMIN', 'EDITOR']}>
              <BrandEditPage />
            </RequireRole>
          }
        />
        <Route
          path="products/brands/:id"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'ADMIN', 'EDITOR']}>
              <BrandEditPage />
            </RequireRole>
          }
        />
        <Route
          path="products/brands"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'ADMIN', 'EDITOR']}>
              <BrandsPage />
            </RequireRole>
          }
        />
        <Route
          path="products/attributes/new"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'ADMIN', 'EDITOR']}>
              <ProductAttributeEditPage />
            </RequireRole>
          }
        />
        <Route
          path="products/attributes/:id"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'ADMIN', 'EDITOR']}>
              <ProductAttributeEditPage />
            </RequireRole>
          }
        />
        <Route
          path="products/attributes"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'ADMIN', 'EDITOR']}>
              <ProductAttributesPage />
            </RequireRole>
          }
        />
        <Route
          path="products/variants"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'STAFF']}>
              <ProductVariantsPage />
            </RequireRole>
          }
        />
        <Route
          path="products/new"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'STAFF']}>
              <ProductEditPage />
            </RequireRole>
          }
        />
        <Route
          path="products/:id/edit"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'STAFF']}>
              <ProductEditPage />
            </RequireRole>
          }
        />
        <Route
          path="products/:id"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'STAFF']}>
              <ProductEditPage />
            </RequireRole>
          }
        />
        <Route
          path="products"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'STAFF']}>
              <ProductsListPage />
            </RequireRole>
          }
        />
        <Route
          path="orders"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'STAFF']}>
              <OrdersListPage />
            </RequireRole>
          }
        />
        <Route
          path="orders/:id"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'STAFF']}>
              <OrderDetailPage />
            </RequireRole>
          }
        />
        <Route
          path="customers"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'STAFF']}>
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
            <RequireRole roles={['SUPER_ADMIN', 'ADMIN', 'EDITOR']}>
              <PagesListPage />
            </RequireRole>
          }
        />
        <Route
          path="content/pages/:id"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'ADMIN', 'EDITOR']}>
              <PageEditPage />
            </RequireRole>
          }
        />
        <Route
          path="content/blog/posts"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'ADMIN', 'EDITOR']}>
              <BlogPostsListPage />
            </RequireRole>
          }
        />
        <Route
          path="content/blog/posts/:id"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'ADMIN', 'EDITOR']}>
              <BlogPostEditPage />
            </RequireRole>
          }
        />
        <Route
          path="content/blog/categories"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'ADMIN', 'EDITOR']}>
              <BlogCategoriesPage />
            </RequireRole>
          }
        />
        <Route
          path="content/menus"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'ADMIN', 'EDITOR']}>
              <MenuManagementPage />
            </RequireRole>
          }
        />
        <Route
          path="media"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'ADMIN', 'EDITOR']}>
              <MediaPage />
            </RequireRole>
          }
        />
        <Route
          path="theme"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'ADMIN', 'EDITOR']}>
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
            <RequireRole roles={['SUPER_ADMIN', 'ADMIN', 'EDITOR']}>
              <Navigate to="/admin/shipping/carriers" replace />
            </RequireRole>
          }
        />
        <Route
          path="shipping/carriers"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'ADMIN', 'EDITOR']}>
              <ShippingCarriersPage />
            </RequireRole>
          }
        />
        <Route
          path="shipping/methods"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'ADMIN', 'EDITOR']}>
              <ShippingMethodsPage />
            </RequireRole>
          }
        />
        <Route
          path="payments"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'ADMIN', 'EDITOR']}>
              <PaymentSettingsPage />
            </RequireRole>
          }
        />
        <Route
          path="reviews"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'STAFF']}>
              <ProductReviewsPage />
            </RequireRole>
          }
        />
        <Route
          path="contact"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'STAFF']}>
              <ContactMessagesPage />
            </RequireRole>
          }
        />
        <Route
          path="contact/forms"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'ADMIN', 'EDITOR']}>
              <FormDefinitionsPage />
            </RequireRole>
          }
        />
        <Route
          path="reports"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'STAFF']}>
              <ReportsPage />
            </RequireRole>
          }
        />
        <Route
          path="promotions/campaigns/new"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'ADMIN', 'EDITOR']}>
              <CampaignEditPage />
            </RequireRole>
          }
        />
        <Route
          path="promotions/campaigns/:id/edit"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'ADMIN', 'EDITOR']}>
              <CampaignEditPage />
            </RequireRole>
          }
        />
        <Route
          path="promotions/coupons/new"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'ADMIN', 'EDITOR']}>
              <CouponEditPage />
            </RequireRole>
          }
        />
        <Route
          path="promotions/coupons/:id/edit"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'ADMIN', 'EDITOR']}>
              <CouponEditPage />
            </RequireRole>
          }
        />
        <Route
          path="promotions"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'ADMIN', 'EDITOR']}>
              <PromotionLayout />
            </RequireRole>
          }
        >
          <Route index element={<Navigate to="campaigns" replace />} />
          <Route path="campaigns" element={<CampaignsPage />} />
          <Route path="coupons" element={<CouponsPage />} />
        </Route>
        <Route
          path="seo"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'ADMIN', 'EDITOR']}>
              <SeoLayout />
            </RequireRole>
          }
        >
          <Route index element={<SeoSettingsPage />} />
          <Route path="redirects" element={<RedirectRulesPage />} />
        </Route>
        <Route
          path="settings"
          element={
            <RequireRole roles={['SUPER_ADMIN', 'ADMIN']}>
              <SettingsLayout />
            </RequireRole>
          }
        >
          <Route index element={<Navigate to="site" replace />} />
          <Route path="site" element={<SiteSettingsPage />} />
          <Route path="company" element={<CompanySettingsPage />} />
          <Route path="mail" element={<MailSettingsPage />} />
          <Route path="mail/templates" element={<MailTemplatesPage />} />
          <Route
            path="mail/templates/:id"
            element={<MailTemplateEditPage />}
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
