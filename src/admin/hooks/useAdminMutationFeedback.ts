import { useCallback } from 'react';
import { ApiError } from '@/shared/api/client';
import { toast } from '@/shared/ui/toast.store';

interface MutationFeedbackOptions {
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

export function useAdminMutationFeedback() {
  const onSuccess = useCallback(
    (message = 'Kaydedildi.') => {
      toast(message, 'success');
    },
    [],
  );

  const onError = useCallback((error: unknown, fallback = 'İşlem başarısız.') => {
    const message =
      error instanceof ApiError ? error.message : fallback;
    toast(message, 'error');
    return message;
  }, []);

  const wrapMutation = useCallback(
    (options: MutationFeedbackOptions = {}) => ({
      onSuccess: () => {
        if (options.successMessage) toast(options.successMessage, 'success');
        options.onSuccess?.();
      },
      onError: (error: unknown) => {
        const message = onError(error, options.errorMessage);
        options.onError?.(message);
      },
    }),
    [onError],
  );

  return { onSuccess, onError, wrapMutation };
}
