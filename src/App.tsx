import { Navigate, Routes, Route, useParams } from 'react-router-dom';
import { AdminRoutes } from '@/admin/routes/AdminRoutes';
import { PublicLayout } from '@/storefront/layout/PublicLayout';
import { ContactPage } from '@/storefront/pages/ContactPage';
import { BlogIndexPage } from '@/storefront/pages/BlogIndexPage';
import { BlogPostPage } from '@/storefront/pages/BlogPostPage';
import { PublicPageView } from '@/storefront/pages/PublicPageView';
import { StorefrontIndexPage } from '@/storefront/pages/StorefrontIndexPage';
import { ProductsIndexPage } from '@/storefront/pages/ProductsIndexPage';
import { ProductDetailPage } from '@/storefront/pages/ProductDetailPage';
import { CategoryDetailPage } from '@/storefront/pages/CategoryDetailPage';
import { BrandDetailPage } from '@/storefront/pages/BrandDetailPage';
import { CartPage } from '@/storefront/pages/CartPage';
import { CheckoutPage } from '@/storefront/pages/CheckoutPage';
import { CustomerLoginPage } from '@/storefront/pages/CustomerLoginPage';
import { OrderSuccessPage } from '@/storefront/pages/OrderSuccessPage';
import { PaymentFailedPage } from '@/storefront/pages/PaymentFailedPage';
import { OrderTrackingPage } from '@/storefront/pages/OrderTrackingPage';
import { SearchPage } from '@/storefront/pages/SearchPage';
import { NotFoundPage } from '@/storefront/pages/NotFoundPage';

function LegacyYazilimSingularRedirect() {
  const { slug } = useParams<{ slug: string }>();
  if (!slug) return <Navigate to="/yazilimlar" replace />;
  return <Navigate to={`/yazilimlar/${slug}`} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<StorefrontIndexPage />} />
        <Route path="urunler" element={<ProductsIndexPage />} />
        <Route
          path="yazilimlar"
          element={<ProductsIndexPage productKind="SOFTWARE" />}
        />
        <Route
          path="yazilimlar/muvekkil-kasa-defteri-saas"
          element={
            <Navigate
              to="/yazilimlar/muvekkil-kasa-defteri-web-tabanli"
              replace
            />
          }
        />
        <Route
          path="yazilimlar/:slug"
          element={<ProductDetailPage productKind="SOFTWARE" />}
        />
        <Route path="urun/:slug" element={<ProductDetailPage />} />
        <Route
          path="yazilim/:slug"
          element={<LegacyYazilimSingularRedirect />}
        />
        <Route path="kategori/:slug" element={<CategoryDetailPage />} />
        <Route path="marka/:slug" element={<BrandDetailPage />} />
        <Route path="sepet" element={<CartPage />} />
        <Route path="giris" element={<CustomerLoginPage />} />
        <Route path="odeme" element={<CheckoutPage />} />
        <Route path="odeme-basarisiz" element={<PaymentFailedPage />} />
        <Route
          path="odeme-basarisiz/:orderNumber"
          element={<PaymentFailedPage />}
        />
        <Route
          path="siparis-basarili/:orderNumber"
          element={<OrderSuccessPage />}
        />
        <Route
          path="siparis/basarili/:orderNumber"
          element={<OrderSuccessPage />}
        />
        <Route path="siparis/takip" element={<OrderTrackingPage />} />
        <Route
          path="siparis/takip/:orderNumber"
          element={<OrderTrackingPage />}
        />
        <Route path="iletisim" element={<ContactPage />} />
        <Route path="blog" element={<BlogIndexPage />} />
        <Route path="blog/:slug" element={<BlogPostPage />} />
        <Route path="sayfa/:slug" element={<PublicPageView />} />
        <Route path="arama" element={<SearchPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
