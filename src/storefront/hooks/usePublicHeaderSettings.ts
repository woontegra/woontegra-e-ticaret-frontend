import { useQuery } from '@tanstack/react-query';
import { getPublicHeaderSettings } from '@/shared/api/header.api';

export function usePublicHeaderSettings() {
  return useQuery({
    queryKey: ['public', 'header-settings'],
    queryFn: getPublicHeaderSettings,
    staleTime: 60_000,
  });
}
