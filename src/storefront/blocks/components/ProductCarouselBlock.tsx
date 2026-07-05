import type { PublicPageBlockDto } from '@/shared/types/api';
import { getProductDisplayMode } from '@/shared/lib/block-model';
import { ProductGridBlock } from './ProductGridBlock';

interface BlockComponentProps {
  block: PublicPageBlockDto;
}

export function ProductCarouselBlock({ block }: BlockComponentProps) {
  const normalizedBlock: PublicPageBlockDto = {
    ...block,
    settings: {
      ...block.settings,
      displayMode: getProductDisplayMode({ ...block, type: 'PRODUCT_CAROUSEL' }),
    },
  };
  return <ProductGridBlock block={normalizedBlock} />;
}
