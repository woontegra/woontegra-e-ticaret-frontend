import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import type { PublicPageBlockDto } from '@/shared/types/api';
import {
  getActiveSlides,
  getHeroVariant,
  parseBlockContent,
  parseBlockSettings,
  type BlockSlideItem,
} from '@/shared/lib/block-model';
import type { HeroVariant } from '@/shared/lib/block-variants';
import { cn } from '@/shared/lib/cn';
import { resolvePublicMediaUrl } from '@/shared/lib/media-url';
import { LazyImage } from '@/shared/ui/LazyImage';
import { HeroImageFallback } from '@/storefront/components/media/ImageFallback';
import { BlockSectionWrapper } from '../../BlockSectionWrapper';
import { getBlockHeadline } from '../../SectionHeading';
import { BlockCarousel } from '../shared/BlockCarousel';

interface BlockComponentProps {
  block: PublicPageBlockDto;
}

function HeroCtaButtons({
  primaryLabel,
  primaryUrl,
  secondaryLabel,
  secondaryUrl,
  inverted = false,
}: {
  primaryLabel?: string;
  primaryUrl?: string;
  secondaryLabel?: string;
  secondaryUrl?: string;
  inverted?: boolean;
}) {
  if (!primaryLabel && !secondaryLabel) return null;

  const primaryClass = inverted
    ? 'inline-block rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-100'
    : 'theme-btn-primary inline-block rounded-md px-5 py-2.5 text-sm font-semibold';

  const secondaryClass = inverted
    ? 'inline-block rounded-md border border-white/30 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10'
    : 'theme-btn-secondary inline-block rounded-md border border-theme-border px-5 py-2.5 text-sm';

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      {primaryLabel && primaryUrl ? (
        primaryUrl.startsWith('/') ? (
          <Link to={primaryUrl} className={primaryClass}>
            {primaryLabel}
          </Link>
        ) : (
          <a href={primaryUrl} className={primaryClass}>
            {primaryLabel}
          </a>
        )
      ) : null}
      {secondaryLabel && secondaryUrl ? (
        secondaryUrl.startsWith('/') ? (
          <Link to={secondaryUrl} className={secondaryClass}>
            {secondaryLabel}
          </Link>
        ) : (
          <a href={secondaryUrl} className={secondaryClass}>
            {secondaryLabel}
          </a>
        )
      ) : null}
    </div>
  );
}

function HeroSlideVisual({
  slide,
  fallbackTitle,
  className,
}: {
  slide: BlockSlideItem;
  fallbackTitle?: string;
  className?: string;
}) {
  const desktopImage = resolvePublicMediaUrl(slide.imageUrl);
  const mobileImage = resolvePublicMediaUrl(slide.mobileImageUrl ?? slide.imageUrl);

  if (desktopImage || mobileImage) {
    return (
      <>
        {mobileImage ? (
          <LazyImage
            src={mobileImage}
            alt={slide.headline ?? fallbackTitle ?? ''}
            className={cn('h-full w-full object-cover md:hidden', className)}
          />
        ) : null}
        {desktopImage ? (
          <LazyImage
            src={desktopImage}
            alt={slide.headline ?? fallbackTitle ?? ''}
            className={cn(
              'h-full w-full object-cover',
              mobileImage ? 'hidden md:block' : '',
              className,
            )}
          />
        ) : null}
      </>
    );
  }

  return (
    <HeroImageFallback
      title={slide.headline ?? fallbackTitle}
      aspectClassName={cn('aspect-[4/3] w-full', className)}
    />
  );
}

function HeroSlidePanel({
  slide,
  variant,
  overlay = false,
}: {
  slide: BlockSlideItem;
  variant?: HeroVariant;
  overlay?: boolean;
}) {
  const alignment = slide.alignment ?? 'left';
  const textAlign =
    alignment === 'center'
      ? 'text-center items-center'
      : alignment === 'right'
        ? 'text-right items-end'
        : 'text-left items-start';

  const content = (
    <div className={cn('flex flex-col', textAlign)}>
      {slide.headline ? (
        <h2
          className={cn(
            'theme-heading text-2xl sm:text-3xl lg:text-4xl',
            overlay ? 'text-white' : '',
          )}
          style={slide.textColor ? { color: slide.textColor } : undefined}
        >
          {slide.headline}
        </h2>
      ) : null}
      {slide.subheadline ? (
        <p
          className={cn(
            'mt-3 text-base leading-relaxed sm:text-lg',
            overlay ? 'text-white/85' : 'text-theme-muted',
          )}
        >
          {slide.subheadline}
        </p>
      ) : null}
      {slide.description ? (
        <p
          className={cn(
            'mt-2 text-sm',
            overlay ? 'text-white/75' : 'text-theme-muted',
          )}
        >
          {slide.description}
        </p>
      ) : null}
      <HeroCtaButtons
        primaryLabel={slide.ctaLabel}
        primaryUrl={slide.ctaUrl}
        secondaryLabel={slide.secondaryCtaLabel}
        secondaryUrl={slide.secondaryCtaUrl}
        inverted={overlay || variant === 'DARK_PANEL'}
      />
    </div>
  );

  if (overlay) {
    return (
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/30 to-transparent p-6 sm:p-10">
        {content}
      </div>
    );
  }

  return content;
}

function HeroCarouselView({ block }: BlockComponentProps) {
  const settings = parseBlockSettings(block.settings);
  const content = parseBlockContent(block.content);
  const slides = useMemo(() => getActiveSlides(content), [content]);
  const [activeIndex, setActiveIndex] = useState(0);
  const slider = settings.slider ?? {};

  if (slides.length === 0) {
    return (
      <BlockSectionWrapper block={block}>
        {getBlockHeadline(block) ? (
          <h1 className="theme-heading text-2xl">{getBlockHeadline(block)}</h1>
        ) : null}
      </BlockSectionWrapper>
    );
  }

  return (
    <BlockSectionWrapper block={block} className="px-0 py-0">
      <BlockCarousel
        itemCount={slides.length}
        activeIndex={activeIndex}
        onActiveIndexChange={setActiveIndex}
        autoplay={slider.autoplay ?? true}
        autoplayDelay={slider.autoplayDelay ?? 6000}
        showDots={slider.showDots ?? true}
        showArrows={slider.showArrows ?? true}
        transitionEffect={slider.transitionEffect ?? 'FADE'}
        loop={slider.loop ?? true}
        desktopHeight={settings.desktopHeight?.trim() || undefined}
        mobileHeight={settings.mobileHeight?.trim() || undefined}
        renderSlide={(index) => {
          const slide = slides[index]!;
          const bgImage = resolvePublicMediaUrl(slide.backgroundImageUrl);
          return (
            <div
              className="relative h-full min-h-[var(--carousel-mobile-height,280px)] w-full overflow-hidden md:min-h-[var(--carousel-desktop-height,420px)]"
              style={{ backgroundColor: slide.backgroundColor }}
            >
              <div className="absolute inset-0">
                {bgImage ? (
                  <img
                    src={bgImage}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <HeroSlideVisual
                    slide={slide}
                    fallbackTitle={slide.headline}
                    className="h-full w-full rounded-none"
                  />
                )}
              </div>
              <HeroSlidePanel slide={slide} overlay />
            </div>
          );
        }}
      />
    </BlockSectionWrapper>
  );
}

function HeroStaticView({
  block,
  variant,
}: BlockComponentProps & { variant: HeroVariant }) {
  const content = parseBlockContent(block.content);
  const headline = getBlockHeadline(block);
  const settings = parseBlockSettings(block.settings);

  const isDark = variant === 'DARK_PANEL';
  const isCentered = variant === 'CENTERED';
  const isFullWidth = variant === 'FULL_WIDTH_BANNER';
  const isSplit = variant === 'SPLIT_IMAGE' || variant === 'SIMPLE';

  const slideFromRoot: BlockSlideItem = {
    headline: content.headline ?? headline,
    subheadline: content.subheadline,
    description: content.description,
    ctaLabel: content.ctaLabel,
    ctaUrl: content.ctaUrl,
    secondaryCtaLabel: content.secondaryCtaLabel,
    secondaryCtaUrl: content.secondaryCtaUrl,
    imageUrl: resolvePublicMediaUrl(content.imageUrl),
  };

  const shellClass = cn(
    'w-full overflow-hidden',
    isFullWidth ? 'rounded-none' : 'rounded-2xl border border-theme-border',
    isDark
      ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white md:p-10 lg:p-12'
      : 'bg-white p-6 sm:p-8',
    isCentered ? 'text-center' : '',
    settings.borderRadius ? `rounded-[${settings.borderRadius}]` : '',
  );

  const gridClass = cn(
    'grid w-full gap-8',
    isSplit && !isCentered ? 'md:grid-cols-2 md:items-center' : 'grid-cols-1',
    isCentered ? 'mx-auto max-w-3xl' : '',
  );

  return (
    <BlockSectionWrapper block={block}>
      <div className={shellClass}>
        <div className={gridClass}>
          <HeroSlidePanel slide={slideFromRoot} variant={variant} overlay={false} />
          {isSplit && !isCentered ? (
            <HeroSlideVisual
              slide={slideFromRoot}
              fallbackTitle={headline}
              className="rounded-xl"
            />
          ) : isFullWidth && slideFromRoot.imageUrl ? (
            <div className="relative mt-6 overflow-hidden rounded-xl">
              <HeroSlideVisual slide={slideFromRoot} fallbackTitle={headline} />
            </div>
          ) : null}
        </div>
      </div>
    </BlockSectionWrapper>
  );
}

export function HeroBlockRouter({ block }: BlockComponentProps) {
  const variant = getHeroVariant(block);

  if (variant === 'CAROUSEL_SLIDER') {
    return <HeroCarouselView block={block} />;
  }

  return <HeroStaticView block={block} variant={variant} />;
}
