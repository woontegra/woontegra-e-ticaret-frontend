import { useQuery } from '@tanstack/react-query';
import { getPublicHomeLayout } from '@/shared/api/layouts.api';

export function usePublicHomeLayout() {
  return useQuery({
    queryKey: ['public', 'layouts', 'home'],
    queryFn: getPublicHomeLayout,
    staleTime: 60_000,
  });
}
