import type { PublicPageBlockDto } from '@/shared/types/api';
import { parseBlockContent } from '@/shared/lib/block-model';
import { BlockSectionWrapper } from '../BlockSectionWrapper';
import { getBlockHeadline } from '../SectionHeading';

interface BlockComponentProps {
  block: PublicPageBlockDto;
}

export function HeroBlock({ block }: BlockComponentProps) {
  const content = parseBlockContent(block.content);
  const headline = getBlockHeadline(block);

  return (
    <BlockSectionWrapper block={block}>
      <div className="grid w-full gap-6 md:grid-cols-2 md:items-center">
        <div>
          {headline ? (
            <h1 className="theme-heading text-2xl sm:text-3xl">{headline}</h1>
          ) : null}
          {content.subheadline ? (
            <p className="mt-2 text-theme-muted">{content.subheadline}</p>
          ) : null}
          {content.description ? (
            <p className="mt-2 text-sm text-theme-muted">{content.description}</p>
          ) : null}
          {content.ctaLabel ? (
            <a
              href={content.ctaUrl ?? '#'}
              className="theme-btn-primary mt-4 inline-block text-sm"
            >
              {content.ctaLabel}
            </a>
          ) : null}
        </div>
        {content.imageUrl ? (
          <img
            src={content.imageUrl}
            alt={headline ?? ''}
            className="aspect-[4/3] w-full rounded-lg object-cover"
          />
        ) : null}
      </div>
    </BlockSectionWrapper>
  );
}
