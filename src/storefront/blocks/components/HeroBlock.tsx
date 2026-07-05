import type { PublicPageBlockDto } from '@/shared/types/api';
import { HeroBlockRouter } from './hero/HeroBlockRouter';

interface BlockComponentProps {
  block: PublicPageBlockDto;
}

export function HeroBlock({ block }: BlockComponentProps) {
  return <HeroBlockRouter block={block} />;
}
