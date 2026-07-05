import { useCallback, useEffect, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import type { CarouselTransition } from '@/shared/lib/block-variants';

interface BlockCarouselProps {
  itemCount: number;
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  renderSlide: (index: number) => ReactNode;
  autoplay?: boolean;
  autoplayDelay?: number;
  showDots?: boolean;
  showArrows?: boolean;
  transitionEffect?: CarouselTransition;
  loop?: boolean;
  desktopHeight?: string;
  mobileHeight?: string;
  className?: string;
}

export function BlockCarousel({
  itemCount,
  activeIndex,
  onActiveIndexChange,
  renderSlide,
  autoplay = true,
  autoplayDelay = 6000,
  showDots = true,
  showArrows = true,
  transitionEffect = 'FADE',
  loop = true,
  desktopHeight,
  mobileHeight,
  className,
}: BlockCarouselProps) {
  const goNext = useCallback(() => {
    if (itemCount <= 1) return;
    onActiveIndexChange(
      loop
        ? (activeIndex + 1) % itemCount
        : Math.min(activeIndex + 1, itemCount - 1),
    );
  }, [activeIndex, itemCount, loop, onActiveIndexChange]);

  const goPrev = useCallback(() => {
    if (itemCount <= 1) return;
    onActiveIndexChange(
      loop
        ? (activeIndex - 1 + itemCount) % itemCount
        : Math.max(activeIndex - 1, 0),
    );
  }, [activeIndex, itemCount, loop, onActiveIndexChange]);

  useEffect(() => {
    if (!autoplay || itemCount <= 1) return;
    const timer = window.setInterval(goNext, autoplayDelay);
    return () => window.clearInterval(timer);
  }, [autoplay, autoplayDelay, goNext, itemCount]);

  if (itemCount === 0) return null;

  const showControls = itemCount > 1;
  const resolvedMobileHeight = mobileHeight?.trim() || '280px';
  const resolvedDesktopHeight = desktopHeight?.trim() || '420px';
  const viewportClass =
    'min-h-[var(--carousel-mobile-height)] md:min-h-[var(--carousel-desktop-height)]';

  return (
    <div
      className={cn('relative w-full overflow-hidden', className)}
      style={
        {
          ['--carousel-desktop-height' as string]: resolvedDesktopHeight,
          ['--carousel-mobile-height' as string]: resolvedMobileHeight,
        } as React.CSSProperties
      }
    >
      <div className={cn('relative w-full', viewportClass)}>
        {transitionEffect === 'SLIDE' ? (
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {Array.from({ length: itemCount }).map((_, index) => (
              <div key={index} className="w-full shrink-0">
                {renderSlide(index)}
              </div>
            ))}
          </div>
        ) : (
          Array.from({ length: itemCount }).map((_, index) => (
            <div
              key={index}
              className={cn(
                'absolute inset-0 transition-opacity duration-500',
                index === activeIndex ? 'opacity-100' : 'pointer-events-none opacity-0',
              )}
            >
              {renderSlide(index)}
            </div>
          ))
        )}
      </div>

      {showControls && showArrows ? (
        <>
          <button
            type="button"
            aria-label="Önceki"
            onClick={goPrev}
            className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/55"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Sonraki"
            onClick={goNext}
            className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/55"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      ) : null}

      {showControls && showDots ? (
        <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center gap-2">
          {Array.from({ length: itemCount }).map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Slide ${index + 1}`}
              onClick={() => onActiveIndexChange(index)}
              className={cn(
                'h-2 w-2 rounded-full transition-colors',
                index === activeIndex ? 'bg-white' : 'bg-white/40',
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
