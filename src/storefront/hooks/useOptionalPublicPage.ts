import { useQuery } from '@tanstack/react-query';
import { ApiError } from '@/shared/api/client';
import { getPublicPage } from '@/shared/api/pages.api';

export function useOptionalPublicPage(slug: string | undefined) {
  return useQuery({
    queryKey: ['public', 'pages', slug, 'optional'],
    queryFn: async () => {
      try {
        return await getPublicPage(slug!);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: Boolean(slug),
    retry: false,
  });
}
