import { parseBlockContent } from '@/shared/lib/block-model';
import type { PublicPageBlockDto } from '@/shared/types/api';
import { BlockSectionWrapper } from '../BlockSectionWrapper';
import { SectionHeading } from '../SectionHeading';

interface BlockComponentProps {
  block: PublicPageBlockDto;
}

export function BrandLogosBlock({ block }: BlockComponentProps) {
  const content = parseBlockContent(block.content);
  const logos = content.brandLogos ?? [];

  return (
    <BlockSectionWrapper block={block}>
      <SectionHeading block={block} />
      {logos.length > 0 ? (
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {logos.map((logo, index) => {
            const image = (
              <img
                src={logo.imageUrl}
                alt={logo.name ?? 'Marka logosu'}
                className="h-10 max-w-[120px] object-contain opacity-80 transition hover:opacity-100 sm:h-12"
              />
            );

            return logo.linkUrl ? (
              <a
                key={`${logo.imageUrl}-${index}`}
                href={logo.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {image}
              </a>
            ) : (
              <span key={`${logo.imageUrl}-${index}`}>{image}</span>
            );
          })}
        </div>
      ) : null}
    </BlockSectionWrapper>
  );
}
