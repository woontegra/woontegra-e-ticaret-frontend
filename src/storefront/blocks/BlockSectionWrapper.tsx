import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import {
  parseBlockSettings,
  type ParsedBlockSettings,
} from '@/shared/lib/block-model';
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

export function BlockSectionWrapper({
  block,
  children,
  className,
}: BlockSectionWrapperProps) {
  const settings = parseBlockSettings(block.settings);

  const sectionStyle: CSSProperties = {
    backgroundColor: settings.backgroundColor,
    color: settings.textColor,
    paddingTop: settings.paddingTop,
    paddingBottom: settings.paddingBottom,
    minHeight: settings.desktopHeight,
  };

  return (
    <section
      className={cn(
        settings.showOnMobile ? '' : 'max-md:hidden',
        className,
      )}
      style={sectionStyle}
      data-block-id={block.id}
    >
      <div
        className={cn(
          settings.fullWidth ? 'w-full px-4 sm:px-6' : 'container mx-auto px-4',
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
