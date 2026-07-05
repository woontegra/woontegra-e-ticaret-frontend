import type { ThemeSettingDto } from '@/shared/types/api';

export function hexToRgbChannels(hex: string): string {
  const normalized = hex.replace('#', '');
  const full =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => char + char)
          .join('')
      : normalized;

  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);

  return `${r} ${g} ${b}`;
}

const RADIUS_MAP: Record<string, string> = {
  none: '0',
  sm: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
};

const SHADOW_MAP: Record<string, string> = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
};

export function applyThemeVariables(
  element: HTMLElement,
  theme: ThemeSettingDto,
): void {
  const { colorPalette, typography, buttonStyle, cardStyle, headerStyle, productCardStyle, layout } =
    theme;

  const baseRadius = RADIUS_MAP[theme.borderRadius] ?? RADIUS_MAP.md;
  const baseShadow = SHADOW_MAP[theme.shadowLevel] ?? SHADOW_MAP.sm;

  const setColor = (name: string, hex: string) => {
    element.style.setProperty(name, hexToRgbChannels(hex));
  };

  setColor('--color-primary', colorPalette.primary);
  setColor('--color-secondary', colorPalette.secondary);
  setColor('--color-accent', colorPalette.accent);
  setColor('--color-background', colorPalette.background);
  setColor('--color-surface', colorPalette.surface);
  setColor('--color-text', colorPalette.text);
  setColor('--color-text-muted', colorPalette.textMuted);
  setColor('--color-border', colorPalette.border);

  element.style.setProperty('--theme-font-body', typography.fontFamily);
  element.style.setProperty('--theme-font-heading', typography.headingFontFamily);
  element.style.setProperty('--theme-font-size', `${typography.baseFontSize}px`);
  element.style.setProperty('--theme-heading-weight', String(typography.headingWeight));
  element.style.setProperty('--theme-line-height', String(typography.lineHeight));
  element.style.setProperty('--theme-container-width', theme.containerWidth);
  element.style.setProperty('--theme-radius-base', baseRadius);
  element.style.setProperty('--theme-shadow-base', baseShadow);

  setColor('--theme-btn-primary-bg', buttonStyle.primaryBg);
  setColor('--theme-btn-primary-text', buttonStyle.primaryText);
  setColor('--theme-btn-primary-hover-bg', buttonStyle.primaryHoverBg);
  element.style.setProperty('--theme-btn-radius', buttonStyle.borderRadius);
  element.style.setProperty('--theme-btn-padding-x', buttonStyle.paddingX);
  element.style.setProperty('--theme-btn-padding-y', buttonStyle.paddingY);
  element.style.setProperty('--theme-btn-font-weight', String(buttonStyle.fontWeight));

  setColor('--theme-card-bg', cardStyle.background);
  setColor('--theme-card-border', cardStyle.borderColor);
  element.style.setProperty('--theme-card-radius', cardStyle.borderRadius);
  element.style.setProperty(
    '--theme-card-shadow',
    SHADOW_MAP[cardStyle.shadow] ?? SHADOW_MAP.sm,
  );
  element.style.setProperty('--theme-card-padding', cardStyle.padding);

  setColor('--theme-header-bg', headerStyle.background);
  setColor('--theme-header-text', headerStyle.textColor);
  setColor('--theme-header-text-hover', headerStyle.textHoverColor);
  setColor('--theme-header-border', headerStyle.borderColor);
  element.style.setProperty('--theme-header-height', headerStyle.height);

  setColor('--theme-product-price', productCardStyle.priceColor);
  element.style.setProperty('--theme-product-radius', productCardStyle.borderRadius);
  element.style.setProperty('--theme-product-image-ratio', productCardStyle.imageRatio);
  element.style.setProperty('--theme-product-title-size', productCardStyle.titleSize);

  element.style.setProperty('--theme-mobile-padding', layout.mobilePadding);
  element.style.setProperty('--theme-section-spacing', layout.sectionSpacing);
  element.style.setProperty('--theme-mobile-font-size', `${layout.mobileFontSize}px`);
  element.style.setProperty('--theme-mobile-header-height', layout.mobileHeaderHeight);
}

export function getThemeCustomCss(theme: ThemeSettingDto): string | null {
  return theme.customCss?.trim() || null;
}
