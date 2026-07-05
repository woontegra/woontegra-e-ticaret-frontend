import { parseBlockContent } from '@/shared/lib/block-model';
import type { PublicPageBlockDto } from '@/shared/types/api';
import { BlockSectionWrapper } from '../BlockSectionWrapper';
import { getBlockHeadline } from '../SectionHeading';

interface BlockComponentProps {
  block: PublicPageBlockDto;
}

export function TextBlock({ block }: BlockComponentProps) {
  const content = parseBlockContent(block.content);
  const title = getBlockHeadline(block);
  const body = content.body ?? content.description;

  if (!title && !body && !content.subheadline) {
    return null;
  }

  return (
    <BlockSectionWrapper block={block}>
      <div className="theme-card w-full">
        {content.subheadline ? (
          <p className="mb-2 text-sm font-medium text-theme-muted">
            {content.subheadline}
          </p>
        ) : null}
        {title ? <h2 className="theme-heading mb-2 text-xl">{title}</h2> : null}
        {body ? (
          <p className="whitespace-pre-line text-theme-muted">{body}</p>
        ) : null}
      </div>
    </BlockSectionWrapper>
  );
}
