import { parseBlockContent } from '@/shared/lib/block-model';
import type { PublicPageBlockDto } from '@/shared/types/api';
import { ContactForm } from '@/storefront/components/ContactForm';
import { BlockSectionWrapper } from '../BlockSectionWrapper';
import { getBlockHeadline } from '../SectionHeading';

interface BlockComponentProps {
  block: PublicPageBlockDto;
}

export function ContactFormBlock({ block }: BlockComponentProps) {
  const content = parseBlockContent(block.content);
  const title = getBlockHeadline(block);
  const formKey =
    typeof content.formKey === 'string' && content.formKey.trim()
      ? content.formKey.trim()
      : null;

  return (
    <BlockSectionWrapper block={block}>
      <div className="theme-card mx-auto w-full max-w-lg">
        <ContactForm
          formKey={formKey}
          title={title ?? undefined}
          description={
            typeof content.description === 'string'
              ? content.description
              : undefined
          }
        />
      </div>
    </BlockSectionWrapper>
  );
}
