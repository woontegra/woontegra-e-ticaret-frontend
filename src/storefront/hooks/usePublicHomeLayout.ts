import { useQuery } from '@tanstack/react-query';
import { getPublicHomeLayout } from '@/shared/api/layouts.api';
import { STALE_TIME } from '@/shared/lib/query-client';

export function usePublicHomeLayout() {
  return useQuery({
    queryKey: ['public', 'layouts', 'home'],
    queryFn: getPublicHomeLayout,
    staleTime: STALE_TIME.public,
    gcTime: STALE_TIME.public * 6,
  });
}
