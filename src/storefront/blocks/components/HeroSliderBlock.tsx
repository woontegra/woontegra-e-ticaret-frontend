import { useMemo, useEffect, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { parseBlockContent } from '@/shared/lib/block-model';
import type { PublicPageBlockDto } from '@/shared/types/api';
import { BlockSectionWrapper } from '../BlockSectionWrapper';
import { getBlockHeadline } from '../SectionHeading';

interface BlockComponentProps {
  block: PublicPageBlockDto;
}

export function HeroSliderBlock({ block }: BlockComponentProps) {
  const content = parseBlockContent(block.content);
  const slides = useMemo(
    () =>
      content.slides ??
      (content.imageUrl || content.headline
        ? [
            {
              headline: content.headline,
              subheadline: content.subheadline,
              description: content.description,
              imageUrl: content.imageUrl,
              ctaLabel: content.ctaLabel,
              ctaUrl: content.ctaUrl,
            },
          ]
        : []),
    [content],
  );

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) {
    return (
      <BlockSectionWrapper block={block}>
        {getBlockHeadline(block) ? (
          <h1 className="theme-heading text-2xl sm:text-3xl">
            {getBlockHeadline(block)}
          </h1>
        ) : null}
      </BlockSectionWrapper>
    );
  }

  const slide = slides[activeIndex];

  return (
    <BlockSectionWrapper block={block}>
      <div className="relative w-full overflow-hidden rounded-lg">
        {slide.imageUrl ? (
          <img
            src={slide.imageUrl}
            alt={slide.headline ?? getBlockHeadline(block) ?? ''}
            className="aspect-[21/9] w-full object-cover"
          />
        ) : (
          <div className="aspect-[21/9] w-full bg-slate-100" />
        )}
        {(slide.headline ||
          slide.subheadline ||
          slide.description ||
          slide.ctaLabel) && (
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-6 text-white sm:p-10">
            {slide.headline ? (
              <h2 className="text-2xl font-semibold sm:text-3xl">{slide.headline}</h2>
            ) : null}
            {slide.subheadline ? (
              <p className="mt-1 text-sm opacity-90">{slide.subheadline}</p>
            ) : null}
            {slide.description ? (
              <p className="mt-2 max-w-xl text-sm opacity-80">{slide.description}</p>
            ) : null}
            {slide.ctaLabel ? (
              <a
                href={slide.ctaUrl ?? '#'}
                className="theme-btn-primary mt-4 inline-block w-fit text-sm"
              >
                {slide.ctaLabel}
              </a>
            ) : null}
          </div>
        )}
      </div>

      {slides.length > 1 ? (
        <div className="mt-4 flex justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Slide ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={cn(
                'h-2 w-2 rounded-full transition-colors',
                index === activeIndex ? 'bg-slate-800' : 'bg-slate-300',
              )}
            />
          ))}
        </div>
      ) : null}
    </BlockSectionWrapper>
  );
}
