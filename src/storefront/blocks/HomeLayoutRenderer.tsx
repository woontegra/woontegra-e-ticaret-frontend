import { cn } from '@/shared/lib/cn';
import type { PublicPageBlockDto } from '@/shared/types/api';
import { BlockRenderer } from './BlockRenderer';

export function HomeLayoutRenderer({
  blocks,
  selectedBlockId,
}: {
  blocks: PublicPageBlockDto[];
  selectedBlockId?: string | null;
}) {
  return (
    <div className="space-y-0">
      {blocks.map((block) => (
        <div
          key={block.id}
          className={cn(
            selectedBlockId === block.id &&
              'outline outline-2 outline-blue-500 outline-offset-[-2px]',
          )}
        >
          <BlockRenderer block={block} />
        </div>
      ))}
    </div>
  );
}
