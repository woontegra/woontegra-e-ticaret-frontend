import { usePublicSiteSettings } from '@/storefront/hooks/usePublicSettings';
import { getStorefrontUi } from '@/shared/lib/storefront-ui';

export function useStorefrontUi() {
  const siteQuery = usePublicSiteSettings();
  return getStorefrontUi(siteQuery.data?.storefrontUi);
}
