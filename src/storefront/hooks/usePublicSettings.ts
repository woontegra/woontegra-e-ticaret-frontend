import { useQuery } from '@tanstack/react-query';
import {
  getPublicCompanySettings,
  getPublicSiteSettings,
} from '@/shared/api/settings.api';

export function usePublicSiteSettings() {
  return useQuery({
    queryKey: ['public', 'site-settings'],
    queryFn: getPublicSiteSettings,
    staleTime: 5 * 60_000,
  });
}

export function usePublicCompanySettings() {
  return useQuery({
    queryKey: ['public', 'company-settings'],
    queryFn: getPublicCompanySettings,
    staleTime: 5 * 60_000,
  });
}
