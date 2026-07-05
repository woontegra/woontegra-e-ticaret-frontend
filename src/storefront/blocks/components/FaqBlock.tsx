import { parseBlockContent } from '@/shared/lib/block-model';
import type { PublicPageBlockDto } from '@/shared/types/api';
import { BlockSectionWrapper } from '../BlockSectionWrapper';
import { SectionHeading } from '../SectionHeading';

interface BlockComponentProps {
  block: PublicPageBlockDto;
}

export function FaqBlock({ block }: BlockComponentProps) {
  const content = parseBlockContent(block.content);
  const items = content.faqItems ?? [];

  return (
    <BlockSectionWrapper block={block}>
      <SectionHeading block={block} />
      {items.length === 0 ? null : (
        <div className="w-full divide-y divide-slate-200 rounded-lg border border-slate-200">
          {items.map((item, index) => (
            <details key={`${item.question}-${index}`} className="group px-4 py-3">
              <summary className="cursor-pointer list-none text-sm font-medium marker:content-none">
                {item.question}
              </summary>
              <p className="mt-2 text-sm text-theme-muted">{item.answer}</p>
            </details>
          ))}
        </div>
      )}
    </BlockSectionWrapper>
  );
}
