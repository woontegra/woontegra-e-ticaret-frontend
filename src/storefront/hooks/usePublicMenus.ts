import { useQuery } from '@tanstack/react-query';
import { getPublicMenus } from '@/shared/api/menus.api';

export function usePublicMenus() {
  return useQuery({
    queryKey: ['public', 'menus'],
    queryFn: getPublicMenus,
    staleTime: 60_000,
  });
}
