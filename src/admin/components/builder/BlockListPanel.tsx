import type { PageBlockDto } from '@/shared/types/api';
import { PAGE_BLOCK_TYPE_LABELS } from '@/shared/api/layouts.api';
import { getBlockDisplayTitle } from '@/shared/lib/block-model';
import { cn } from '@/shared/lib/cn';
import { Badge, Button } from '@/shared/ui';
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  GripVertical,
  Trash2,
} from 'lucide-react';

interface BlockListPanelProps {
  blocks: PageBlockDto[];
  selectedBlockId: string | null;
  onSelect: (blockId: string) => void;
  onMoveUp: (blockId: string) => void;
  onMoveDown: (blockId: string) => void;
  onToggleActive: (blockId: string) => void;
  onDelete: (blockId: string) => void;
}

export function BlockListPanel({
  blocks,
  selectedBlockId,
  onSelect,
  onMoveUp,
  onMoveDown,
  onToggleActive,
  onDelete,
}: BlockListPanelProps) {
  if (blocks.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <p className="text-sm text-slate-500">Henüz blok yok.</p>
        <p className="mt-1 text-xs text-slate-400">
          Üstten &quot;Blok ekle&quot; ile başlayın.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-slate-100">
      {blocks.map((block, index) => {
        const isSelected = block.id === selectedBlockId;
        const title = getBlockDisplayTitle(block);

        return (
          <li key={block.id}>
            <div
              className={cn(
                'group flex items-start gap-1 px-2 py-2 transition-colors',
                isSelected ? 'bg-slate-100' : 'hover:bg-slate-50',
              )}
            >
              <GripVertical className="mt-2 h-4 w-4 shrink-0 text-slate-300" />

              <button
                type="button"
                onClick={() => onSelect(block.id)}
                className="min-w-0 flex-1 text-left"
              >
                <p className="truncate text-sm font-medium text-slate-800">
                  {title}
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-1">
                  <span className="text-[11px] text-slate-500">
                    {PAGE_BLOCK_TYPE_LABELS[block.type]}
                  </span>
                  {!block.isActive ? (
                    <Badge variant="default">Gizli</Badge>
                  ) : null}
                </div>
              </button>

              <div className="flex shrink-0 flex-col gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  disabled={index === 0}
                  onClick={() => onMoveUp(block.id)}
                  aria-label="Yukarı taşı"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  disabled={index === blocks.length - 1}
                  onClick={() => onMoveDown(block.id)}
                  aria-label="Aşağı taşı"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="flex shrink-0 gap-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => onToggleActive(block.id)}
                  aria-label={block.isActive ? 'Gizle' : 'Göster'}
                >
                  {block.isActive ? (
                    <Eye className="h-3.5 w-3.5" />
                  ) : (
                    <EyeOff className="h-3.5 w-3.5 text-slate-400" />
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                  onClick={() => onDelete(block.id)}
                  aria-label="Sil"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
