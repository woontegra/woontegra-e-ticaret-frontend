import type { StorefrontUiLabels } from '@/shared/types/api';

export function getStorefrontUi(
  storefrontUi?: StorefrontUiLabels,
): StorefrontUiLabels {
  return storefrontUi ?? {};
}

export function uiLabel(
  storefrontUi: StorefrontUiLabels | undefined,
  key: keyof StorefrontUiLabels,
): string | undefined {
  const value = storefrontUi?.[key];
  return value?.trim() ? value.trim() : undefined;
}

export function uiLabelFormat(
  storefrontUi: StorefrontUiLabels | undefined,
  key: keyof StorefrontUiLabels,
  vars: Record<string, string | number>,
): string | undefined {
  const template = uiLabel(storefrontUi, key);
  if (!template) return undefined;

  return Object.entries(vars).reduce(
    (result, [name, value]) => result.replace(`{${name}}`, String(value)),
    template,
  );
}
