import { useEffect, useRef, type ReactNode } from 'react';
import type { ThemeSettingDto } from '@/shared/types/api';
import {
  applyThemeVariables,
  getThemeCustomCss,
} from '@/storefront/theme/applyThemeVariables';

interface ThemeProviderProps {
  theme?: ThemeSettingDto;
  children: ReactNode;
}

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!theme || !rootRef.current) return;
    applyThemeVariables(rootRef.current, theme);
  }, [theme]);

  const customCss = theme ? getThemeCustomCss(theme) : null;

  return (
    <div
      ref={rootRef}
      className="theme-storefront flex min-h-screen flex-col bg-theme-bg text-theme-text"
      style={{ fontFamily: 'var(--theme-font-body)', fontSize: 'var(--theme-font-size)' }}
    >
      {customCss ? <style>{customCss}</style> : null}
      {children}
    </div>
  );
}
