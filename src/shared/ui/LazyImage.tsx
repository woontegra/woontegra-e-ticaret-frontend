import type { ImgHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  eager?: boolean;
}

export function LazyImage({ eager = false, className, ...props }: LazyImageProps) {
  return (
    <img
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={cn(className)}
      {...props}
    />
  );
}
