import { Routes, Route } from 'react-router-dom';
import { AdminRoutes } from '@/admin/routes/AdminRoutes';
import { PublicLayout } from '@/storefront/layout/PublicLayout';
import { ContactPage } from '@/storefront/pages/ContactPage';
import { StorefrontIndexPage } from '@/storefront/pages/StorefrontIndexPage';

export default function App() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<StorefrontIndexPage />} />
        <Route path="iletisim" element={<ContactPage />} />
      </Route>
    </Routes>
  );
}