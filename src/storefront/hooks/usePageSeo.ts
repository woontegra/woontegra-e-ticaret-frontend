import {
  usePublicSeoSettings,
  usePublicSiteSettings,
} from '@/storefront/hooks/usePublicSettings';

export function usePageSeo() {
  const siteQuery = usePublicSiteSettings();
  const seoQuery = usePublicSeoSettings();

  return {
    siteSettings: siteQuery.data,
    seoSettings: seoQuery.data,
    isLoading: siteQuery.isLoading || seoQuery.isLoading,
  };
}
