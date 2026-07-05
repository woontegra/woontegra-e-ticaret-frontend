import { ThemeProvider } from '@/storefront/theme/ThemeProvider';
import { HomeLayoutRenderer } from '@/storefront/blocks/HomeLayoutRenderer';
import { toPublicBlockDto } from '@/shared/lib/block-model';
import type { PageBlockDto } from '@/shared/types/api';

interface BuilderPreviewProps {
  blocks: PageBlockDto[];
  selectedBlockId: string | null;
}

export function BuilderPreview({ blocks, selectedBlockId }: BuilderPreviewProps) {
  const previewBlocks = blocks
    .filter((block) => block.isActive)
    .map(toPublicBlockDto);

  return (
    <ThemeProvider>
      <div className="min-h-full bg-[var(--theme-bg,#f8fafc)] p-4">
        {previewBlocks.length === 0 ? (
          <div className="flex min-h-[240px] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white">
            <p className="text-sm text-slate-500">
              Aktif blok yok. Sol panelden blok ekleyin veya gizli blokları
              gösterin.
            </p>
          </div>
        ) : (
          <HomeLayoutRenderer
            blocks={previewBlocks}
            selectedBlockId={selectedBlockId}
          />
        )}
      </div>
    </ThemeProvider>
  );
}
