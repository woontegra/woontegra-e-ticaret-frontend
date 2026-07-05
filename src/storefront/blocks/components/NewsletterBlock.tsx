import { parseBlockContent } from '@/shared/lib/block-model';
import type { PublicPageBlockDto } from '@/shared/types/api';
import { NewsletterForm } from '@/storefront/components/NewsletterForm';
import { BlockSectionWrapper } from '../BlockSectionWrapper';
import { getBlockHeadline } from '../SectionHeading';

interface BlockComponentProps {
  block: PublicPageBlockDto;
}

export function NewsletterBlock({ block }: BlockComponentProps) {
  const content = parseBlockContent(block.content);
  const title = getBlockHeadline(block);

  if (!content.emailPlaceholder?.trim() || !content.buttonLabel?.trim()) {
    return null;
  }

  return (
    <BlockSectionWrapper block={block}>
      <NewsletterForm
        className="theme-card mx-auto w-full max-w-xl text-center"
        title={title}
        description={content.description}
        placeholder={content.emailPlaceholder}
        buttonLabel={content.buttonLabel}
        successMessage={content.successMessage}
        source={`block:${block.id}`}
      />
    </BlockSectionWrapper>
  );
}
