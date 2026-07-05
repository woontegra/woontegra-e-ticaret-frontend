import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { parseBlockSettings, type ParsedBlockSettings } from '@/shared/lib/block-model';
import { resolvePublicMediaUrl } from '@/shared/lib/media-url';
import type { PublicPageBlockDto } from '@/shared/types/api';

const alignmentClass: Record<ParsedBlockSettings['alignment'], string> = {
  left: 'text-left items-start',
  center: 'text-center items-center',
  right: 'text-right items-end',
};

interface BlockSectionWrapperProps {
  block: PublicPageBlockDto;
  children: ReactNode;
  className?: string;
}

function resolveBackgroundStyle(settings: ParsedBlockSettings): CSSProperties {
  switch (settings.backgroundType) {
    case 'COLOR':
      return { backgroundColor: settings.backgroundColor };
    case 'GRADIENT':
      return {
        background: settings.backgroundGradient ?? settings.backgroundColor,
      };
    case 'IMAGE':
      return settings.backgroundImageUrl
        ? {
            backgroundImage: `url(${resolvePublicMediaUrl(settings.backgroundImageUrl) ?? settings.backgroundImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }
        : {};
    default:
      return settings.backgroundColor
        ? { backgroundColor: settings.backgroundColor }
        : {};
  }
}

function containerClass(settings: ParsedBlockSettings): string {
  switch (settings.containerMode) {
    case 'FULL_WIDTH':
      return 'w-full px-4 sm:px-6 lg:px-8';
    case 'WIDE':
      return 'mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8';
    default:
      return 'container mx-auto px-4 sm:px-6 lg:px-8';
  }
}

export function BlockSectionWrapper({
  block,
  children,
  className,
}: BlockSectionWrapperProps) {
  const settings = parseBlockSettings(block.settings);

  const sectionStyle: CSSProperties = {
    ...resolveBackgroundStyle(settings),
    color: settings.textColor,
    paddingTop: settings.paddingTop,
    paddingBottom: settings.paddingBottom,
    minHeight: settings.desktopHeight,
    borderRadius: settings.borderRadius,
  };

  return (
    <section
      className={cn(
        !settings.desktopVisible ? 'hidden' : '',
        !settings.mobileVisible ? 'max-md:hidden' : '',
        settings.customClass,
        className,
      )}
      style={sectionStyle}
      data-block-id={block.id}
    >
      <div
        className={cn(
          containerClass(settings),
          'flex flex-col',
          alignmentClass[settings.alignment],
        )}
        style={{ minHeight: settings.mobileHeight }}
      >
        {children}
      </div>
    </section>
  );
}
