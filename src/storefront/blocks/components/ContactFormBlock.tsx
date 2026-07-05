import { useState, type FormEvent } from 'react';
import { parseBlockContent } from '@/shared/lib/block-model';
import type { PublicPageBlockDto } from '@/shared/types/api';
import { BlockSectionWrapper } from '../BlockSectionWrapper';
import { getBlockHeadline } from '../SectionHeading';

interface BlockComponentProps {
  block: PublicPageBlockDto;
}

export function ContactFormBlock({ block }: BlockComponentProps) {
  const content = parseBlockContent(block.content);
  const title = getBlockHeadline(block);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <BlockSectionWrapper block={block}>
      <div className="theme-card mx-auto w-full max-w-lg">
        {title ? <h2 className="theme-heading mb-4 text-xl">{title}</h2> : null}
        {content.description ? (
          <p className="mb-4 text-sm text-theme-muted">{content.description}</p>
        ) : null}

        {submitted ? (
          <p className="text-sm text-theme-muted">
            Mesajınız alındı. En kısa sürede size dönüş yapılacaktır.
          </p>
        ) : (
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div>
              <label htmlFor={`contact-name-${block.id}`} className="mb-1 block text-xs text-theme-muted">
                Ad Soyad
              </label>
              <input
                id={`contact-name-${block.id}`}
                name="name"
                required
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor={`contact-email-${block.id}`} className="mb-1 block text-xs text-theme-muted">
                E-posta
              </label>
              <input
                id={`contact-email-${block.id}`}
                name="email"
                type="email"
                required
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor={`contact-message-${block.id}`} className="mb-1 block text-xs text-theme-muted">
                Mesaj
              </label>
              <textarea
                id={`contact-message-${block.id}`}
                name="message"
                required
                rows={4}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <button type="submit" className="theme-btn-primary px-4 py-2 text-sm">
              Gönder
            </button>
          </form>
        )}
      </div>
    </BlockSectionWrapper>
  );
}
