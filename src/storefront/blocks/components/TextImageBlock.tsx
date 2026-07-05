import { parseBlockContent } from '@/shared/lib/block-model';
import type { PublicPageBlockDto } from '@/shared/types/api';
import { BlockSectionWrapper } from '../BlockSectionWrapper';
import { getBlockHeadline } from '../SectionHeading';

interface BlockComponentProps {
  block: PublicPageBlockDto;
}

export function TextImageBlock({ block }: BlockComponentProps) {
  const content = parseBlockContent(block.content);
  const title = getBlockHeadline(block);

  if (!title && !content.body && !content.description && !content.imageUrl) {
    return null;
  }

  return (
    <BlockSectionWrapper block={block}>
      <div className="grid w-full gap-6 md:grid-cols-2 md:items-center">
        <div>
          {title ? <h2 className="theme-heading text-xl">{title}</h2> : null}
          {content.subheadline ? (
            <p className="mt-1 text-sm font-medium">{content.subheadline}</p>
          ) : null}
          {content.description ? (
            <p className="mt-2 text-theme-muted">{content.description}</p>
          ) : null}
          {content.body ? (
            <p className="mt-2 whitespace-pre-line text-theme-muted">{content.body}</p>
          ) : null}
        </div>
        {content.imageUrl ? (
          <img
            src={content.imageUrl}
            alt={title ?? ''}
            className="aspect-[4/3] w-full rounded-lg object-cover"
          />
        ) : null}
      </div>
    </BlockSectionWrapper>
  );
}
