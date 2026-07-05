import { Outlet } from 'react-router-dom';
import { PromotionSubNav } from '@/admin/components/PromotionSubNav';

export function PromotionLayout() {
  return (
    <div>
      <PromotionSubNav />
      <Outlet />
    </div>
  );
}
