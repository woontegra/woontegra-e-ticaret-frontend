import type { StorefrontUiLabels } from '@/shared/types/api';
import { uiLabel } from '@/shared/lib/storefront-ui';
import { useStorefrontUi } from '@/storefront/hooks/useStorefrontUi';

type BlockEmptyStateKey = Extract<
  keyof StorefrontUiLabels,
  'emptyProducts' | 'emptyCategories' | 'emptyBlog'
>;

interface BlockEmptyStateProps {
  messageKey: BlockEmptyStateKey;
}

export function BlockEmptyState({ messageKey }: BlockEmptyStateProps) {
  const ui = useStorefrontUi();
  const message = uiLabel(ui, messageKey);

  if (!message) return null;

  return (
    <p className="w-full py-6 text-center text-sm text-theme-muted">{message}</p>
  );
}
