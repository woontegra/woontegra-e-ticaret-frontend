import { Routes, Route } from 'react-router-dom';
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
import { OrderSuccessPage } from '@/storefront/pages/OrderSuccessPage';

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
        <Route path="urun/:slug" element={<ProductDetailPage />} />
        <Route path="yazilim/:slug" element={<ProductDetailPage />} />
        <Route path="kategori/:slug" element={<CategoryDetailPage />} />
        <Route path="marka/:slug" element={<BrandDetailPage />} />
        <Route path="sepet" element={<CartPage />} />
        <Route path="odeme" element={<CheckoutPage />} />
        <Route
          path="siparis/basarili/:orderNumber"
          element={<OrderSuccessPage />}
        />
        <Route path="iletisim" element={<ContactPage />} />
        <Route path="blog" element={<BlogIndexPage />} />
        <Route path="blog/:slug" element={<BlogPostPage />} />
        <Route path="sayfa/:slug" element={<PublicPageView />} />
      </Route>
    </Routes>
  );
}