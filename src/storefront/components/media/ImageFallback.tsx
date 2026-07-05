import { Cloud, Download, KeyRound, Layers, Monitor, Shield } from 'lucide-react';
import type { DeliveryMode } from '@/shared/types/api';
import { cn } from '@/shared/lib/cn';

type FallbackVariant = 'product' | 'blog' | 'hero';

interface ImageFallbackProps {
  variant?: FallbackVariant;
  title?: string;
  deliveryMode?: DeliveryMode;
  className?: string;
  aspectClassName?: string;
}

function ProductIcon({ deliveryMode }: { deliveryMode?: DeliveryMode }) {
  const className = 'h-10 w-10 text-white/90';
  switch (deliveryMode) {
    case 'FREE_DOWNLOAD':
      return <Download className={className} />;
    case 'LICENSED_DOWNLOAD':
      return <KeyRound className={className} />;
    case 'SAAS':
      return <Cloud className={className} />;
    case 'QUOTE_ONLY':
      return <Layers className={className} />;
    default:
      return <Monitor className={className} />;
  }
}

function gradientForVariant(
  variant: FallbackVariant,
  deliveryMode?: DeliveryMode,
): string {
  if (variant === 'blog') {
    return 'from-slate-800 via-slate-700 to-slate-900';
  }
  if (variant === 'hero') {
    return 'from-slate-900 via-slate-800 to-slate-700';
  }
  switch (deliveryMode) {
    case 'FREE_DOWNLOAD':
      return 'from-emerald-700 via-teal-800 to-slate-900';
    case 'LICENSED_DOWNLOAD':
      return 'from-blue-800 via-indigo-900 to-slate-900';
    case 'SAAS':
      return 'from-violet-700 via-purple-900 to-slate-900';
    case 'QUOTE_ONLY':
      return 'from-amber-700 via-orange-900 to-slate-900';
    default:
      return 'from-slate-800 via-slate-700 to-slate-900';
  }
}

export function ImageFallback({
  variant = 'product',
  title,
  deliveryMode,
  className,
  aspectClassName = 'aspect-[4/3]',
}: ImageFallbackProps) {
  const gradient = gradientForVariant(variant, deliveryMode);
  const showIcon = variant === 'product';
  const showBrand = variant !== 'blog';

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-gradient-to-br',
        gradient,
        aspectClassName,
        className,
      )}
      aria-hidden
    >
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-10 -right-6 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="relative flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        {showIcon ? (
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
            <ProductIcon deliveryMode={deliveryMode} />
          </div>
        ) : variant === 'blog' ? (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
            <Shield className="h-7 w-7 text-white/90" />
          </div>
        ) : null}

        {title ? (
          <p className="max-w-[14rem] text-sm font-medium leading-snug text-white/95 line-clamp-3">
            {title}
          </p>
        ) : null}

        {showBrand ? (
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
            Woontegra
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function ProductImageFallback(
  props: Omit<ImageFallbackProps, 'variant'> & { deliveryMode?: DeliveryMode },
) {
  return (
    <ImageFallback
      {...props}
      variant="product"
      aspectClassName={props.aspectClassName ?? 'theme-product-card-image w-full'}
    />
  );
}

export function BlogImageFallback(
  props: Omit<ImageFallbackProps, 'variant'>,
) {
  return (
    <ImageFallback
      {...props}
      variant="blog"
      aspectClassName={props.aspectClassName ?? 'aspect-[16/9] w-full'}
    />
  );
}

export function HeroImageFallback(
  props: Omit<ImageFallbackProps, 'variant'>,
) {
  return (
    <ImageFallback
      {...props}
      variant="hero"
      aspectClassName={props.aspectClassName ?? 'h-full w-full min-h-[12rem]'}
    />
  );
}
