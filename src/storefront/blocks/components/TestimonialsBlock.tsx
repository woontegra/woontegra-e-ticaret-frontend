import { parseBlockContent } from '@/shared/lib/block-model';
import type { PublicPageBlockDto } from '@/shared/types/api';
import { BlockSectionWrapper } from '../BlockSectionWrapper';
import { SectionHeading } from '../SectionHeading';

interface BlockComponentProps {
  block: PublicPageBlockDto;
}

export function TestimonialsBlock({ block }: BlockComponentProps) {
  const content = parseBlockContent(block.content);
  const testimonials = content.testimonials ?? [];

  return (
    <BlockSectionWrapper block={block}>
      <SectionHeading block={block} />
      {testimonials.length > 0 ? (
        <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item, index) => (
            <figure
              key={`${item.name}-${index}`}
              className="theme-card flex h-full flex-col p-5"
            >
              <blockquote className="flex-1 text-sm text-theme-muted">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-4 flex items-center gap-3">
                {item.avatarUrl ? (
                  <img
                    src={item.avatarUrl}
                    alt={item.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                    {item.name.charAt(0)}
                  </span>
                )}
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  {item.role ? (
                    <p className="text-xs text-theme-muted">{item.role}</p>
                  ) : null}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      ) : null}
    </BlockSectionWrapper>
  );
}
