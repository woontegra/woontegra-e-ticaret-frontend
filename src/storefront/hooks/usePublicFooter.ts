import { useQuery } from '@tanstack/react-query';
import { getPublicFooter } from '@/shared/api/footer.api';

export function usePublicFooter() {
  return useQuery({
    queryKey: ['public', 'footer'],
    queryFn: getPublicFooter,
    staleTime: 60_000,
  });
}
