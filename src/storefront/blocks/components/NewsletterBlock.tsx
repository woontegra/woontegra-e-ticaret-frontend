import { useState, type FormEvent } from 'react';
import { parseBlockContent } from '@/shared/lib/block-model';
import type { PublicPageBlockDto } from '@/shared/types/api';
import { BlockSectionWrapper } from '../BlockSectionWrapper';
import { getBlockHeadline } from '../SectionHeading';

interface BlockComponentProps {
  block: PublicPageBlockDto;
}

export function NewsletterBlock({ block }: BlockComponentProps) {
  const content = parseBlockContent(block.content);
  const title = getBlockHeadline(block);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <BlockSectionWrapper block={block}>
      <div className="theme-card mx-auto w-full max-w-xl text-center">
        {title ? <h2 className="theme-heading text-xl">{title}</h2> : null}
        {content.description ? (
          <p className="mt-2 text-sm text-theme-muted">{content.description}</p>
        ) : null}

        {submitted ? (
          <p className="mt-4 text-sm text-theme-muted">
            Abonelik talebiniz alındı.
          </p>
        ) : (
          <form
            className="mt-4 flex flex-col gap-2 sm:flex-row"
            onSubmit={handleSubmit}
          >
            <input
              type="email"
              name="email"
              required
              placeholder="E-posta adresiniz"
              className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
            <button type="submit" className="theme-btn-primary px-4 py-2 text-sm">
              Abone ol
            </button>
          </form>
        )}
      </div>
    </BlockSectionWrapper>
  );
}
