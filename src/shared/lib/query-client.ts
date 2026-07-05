import { QueryClient } from '@tanstack/react-query';

export const STALE_TIME = {
  public: 5 * 60_000,
  admin: 60_000,
  settings: 10 * 60_000,
} as const;

export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME.admin,
        gcTime: 30 * 60_000,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

export function isInitialQueryLoading(
  isLoading: boolean,
  isFetching: boolean,
  hasData: boolean,
) {
  return isLoading || (isFetching && !hasData);
}
