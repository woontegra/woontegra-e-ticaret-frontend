import { parseBlockSettings } from '@/shared/lib/block-model';
import type { PublicPageBlockDto } from '@/shared/types/api';

interface BlockComponentProps {
  block: PublicPageBlockDto;
}

export function SpacerBlock({ block }: BlockComponentProps) {
  const settings = parseBlockSettings(block.settings);
  const height = settings.height ?? '2rem';

  return (
    <div
      style={{ height }}
      className="w-full bg-transparent"
      aria-hidden
      data-block-id={block.id}
    />
  );
}
