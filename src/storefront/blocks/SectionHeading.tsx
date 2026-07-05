import type { PublicPageBlockDto } from '@/shared/types/api';
import { parseBlockContent } from '@/shared/lib/block-model';

interface SectionHeadingProps {
  block: PublicPageBlockDto;
  as?: 'h1' | 'h2';
}

export function SectionHeading({ block, as = 'h2' }: SectionHeadingProps) {
  const content = parseBlockContent(block.content);
  const title = block.title ?? content.headline;
  const Tag = as;

  if (!title && !content.description && !content.subheadline) {
    return null;
  }

  return (
    <header className="mb-4 w-full">
      {content.subheadline ? (
        <p className="text-sm font-medium text-theme-muted">{content.subheadline}</p>
      ) : null}
      {title ? (
        <Tag className="theme-heading text-xl sm:text-2xl">{title}</Tag>
      ) : null}
      {content.description ? (
        <p className="mt-1 text-sm text-theme-muted">{content.description}</p>
      ) : null}
    </header>
  );
}

export function getBlockHeadline(block: PublicPageBlockDto): string | undefined {
  const content = parseBlockContent(block.content);
  return block.title ?? content.headline;
}
