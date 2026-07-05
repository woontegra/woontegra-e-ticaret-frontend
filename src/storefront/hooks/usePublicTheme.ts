import { useQuery } from '@tanstack/react-query';
import { getPublicThemeSettings } from '@/shared/api/theme.api';

export function usePublicTheme() {
  return useQuery({
    queryKey: ['public', 'theme-settings'],
    queryFn: getPublicThemeSettings,
    staleTime: 60_000,
  });
}
