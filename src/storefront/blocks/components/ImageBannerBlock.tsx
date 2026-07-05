import { parseBlockContent } from '@/shared/lib/block-model';
import type { PublicPageBlockDto } from '@/shared/types/api';
import { BlockSectionWrapper } from '../BlockSectionWrapper';
import { getBlockHeadline } from '../SectionHeading';

interface BlockComponentProps {
  block: PublicPageBlockDto;
}

export function ImageBannerBlock({ block }: BlockComponentProps) {
  const content = parseBlockContent(block.content);
  const title = getBlockHeadline(block);

  if (!content.imageUrl && !title && !content.description) {
    return null;
  }

  const inner = (
    <div className="relative w-full overflow-hidden rounded-lg">
      {content.imageUrl ? (
        <img
          src={content.imageUrl}
          alt={title ?? 'Banner'}
          className="min-h-[200px] w-full object-cover"
        />
      ) : null}
      {(title || content.description) && (
        <div
          className={
            content.imageUrl
              ? 'absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-6 text-white'
              : 'p-6'
          }
        >
          {title ? <h2 className="text-xl font-semibold">{title}</h2> : null}
          {content.description ? (
            <p className="mt-1 text-sm opacity-90">{content.description}</p>
          ) : null}
        </div>
      )}
    </div>
  );

  return (
    <BlockSectionWrapper block={block}>
      {content.linkUrl ? (
        <a href={content.linkUrl} className="block">
          {inner}
        </a>
      ) : (
        inner
      )}
    </BlockSectionWrapper>
  );
}
