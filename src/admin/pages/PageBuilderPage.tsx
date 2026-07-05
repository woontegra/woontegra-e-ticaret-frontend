import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, Plus, Save, Upload } from 'lucide-react';
import type { PageBlockDto, PageBlockType } from '@/shared/types/api';
import {
  createLayoutBlock,
  deleteLayoutBlock,
  getHomeDraftLayout,
  publishLayout,
  reorderLayoutBlocks,
  updateLayoutBlock,
} from '@/shared/api/layouts.api';
import { AddBlockModal } from '@/admin/components/builder/AddBlockModal';
import { useAdminMutationFeedback } from '@/admin/hooks/useAdminMutationFeedback';
import { BlockListPanel } from '@/admin/components/builder/BlockListPanel';
import { BlockSettingsPanel } from '@/admin/components/builder/BlockSettingsPanel';
import { BuilderPreview } from '@/admin/components/builder/BuilderPreview';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import {
  blocksSnapshot,
  createDefaultBlockPayload,
  sortBlocks,
} from '@/shared/lib/block-model';
import { Badge, Button, Card, CardHeader, Modal } from '@/shared/ui';
import { HomeLayoutSkeleton } from '@/storefront/blocks/HomeLayoutSkeleton';

function reindexBlocks(blocks: PageBlockDto[]): PageBlockDto[] {
  return blocks.map((block, index) => ({ ...block, sortOrder: index }));
}

function moveBlock(
  blocks: PageBlockDto[],
  blockId: string,
  direction: -1 | 1,
): PageBlockDto[] {
  const sorted = sortBlocks(blocks);
  const index = sorted.findIndex((block) => block.id === blockId);
  if (index < 0) return blocks;

  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= sorted.length) return blocks;

  const next = [...sorted];
  [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
  return reindexBlocks(next);
}

export function PageBuilderPage() {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = useAdminMutationFeedback();
  const addModal = useDisclosure();
  const deleteModal = useDisclosure();

  const [initialized, setInitialized] = useState(false);
  const [localBlocks, setLocalBlocks] = useState<PageBlockDto[]>([]);
  const [baselineSnapshot, setBaselineSnapshot] = useState('');
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [blockToDelete, setBlockToDelete] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const layoutQuery = useQuery({
    queryKey: ['admin', 'layouts', 'home', 'draft'],
    queryFn: getHomeDraftLayout,
  });

  const layout = layoutQuery.data;
  const layoutId = layout?.id;

  useEffect(() => {
    if (!layout?.blocks) return;

    const sorted = sortBlocks(layout.blocks);

    if (!initialized) {
      setLocalBlocks(sorted);
      setBaselineSnapshot(blocksSnapshot(sorted));
      setSelectedBlockId(sorted[0]?.id ?? null);
      setInitialized(true);
      return;
    }

    const dirty = blocksSnapshot(localBlocks) !== baselineSnapshot;
    if (!dirty) {
      setLocalBlocks(sorted);
      setBaselineSnapshot(blocksSnapshot(sorted));
      if (
        selectedBlockId &&
        !sorted.some((block) => block.id === selectedBlockId)
      ) {
        setSelectedBlockId(sorted[0]?.id ?? null);
      }
    }
  }, [layout?.blocks, layout?.id, initialized]);

  const isDirty = useMemo(
    () => blocksSnapshot(localBlocks) !== baselineSnapshot,
    [localBlocks, baselineSnapshot],
  );

  const selectedBlock = useMemo(
    () => localBlocks.find((block) => block.id === selectedBlockId) ?? null,
    [localBlocks, selectedBlockId],
  );

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'layouts', 'home', 'draft'] });
    queryClient.invalidateQueries({ queryKey: ['public', 'layouts', 'home'] });
  };

  const saveDraftMutation = useMutation({
    mutationFn: async () => {
      if (!layoutId) throw new Error('Layout bulunamadı');

      const serverBlocks = sortBlocks(layout?.blocks ?? []);
      const orderChanged =
        JSON.stringify(serverBlocks.map((block) => block.id)) !==
        JSON.stringify(localBlocks.map((block) => block.id));

      if (orderChanged) {
        await reorderLayoutBlocks(layoutId, {
          items: localBlocks.map((block, index) => ({
            id: block.id,
            sortOrder: index,
          })),
        });
      }

      for (const block of localBlocks) {
        const serverBlock = serverBlocks.find((item) => item.id === block.id);
        if (!serverBlock) continue;

        const changed =
          serverBlock.title !== block.title ||
          serverBlock.isActive !== block.isActive ||
          JSON.stringify(serverBlock.settings) !== JSON.stringify(block.settings) ||
          JSON.stringify(serverBlock.content) !== JSON.stringify(block.content);

        if (changed) {
          await updateLayoutBlock(layoutId, block.id, {
            title: block.title,
            settings: block.settings,
            content: block.content,
            isActive: block.isActive,
            sortOrder: block.sortOrder,
          });
        }
      }
    },
    onSuccess: () => {
      setBaselineSnapshot(blocksSnapshot(localBlocks));
      setErrorMessage(null);
      onSuccess('Taslak kaydedildi.');
      invalidate();
    },
    onError: (error) => {
      const message = onError(error, 'Taslak kaydedilemedi.');
      setErrorMessage(message);
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      if (!layoutId) throw new Error('Layout bulunamadı');
      if (isDirty) {
        await saveDraftMutation.mutateAsync();
      }
      return publishLayout(layoutId);
    },
    onSuccess: () => {
      setErrorMessage(null);
      onSuccess('Ana sayfa yayınlandı.');
      invalidate();
    },
    onError: (error) => {
      const message = onError(error, 'Yayınlama başarısız.');
      setErrorMessage(message);
    },
  });

  const addBlockMutation = useMutation({
    mutationFn: async (type: PageBlockType) => {
      if (!layoutId) throw new Error('Layout bulunamadı');

      const defaults = createDefaultBlockPayload(type);
      return createLayoutBlock(layoutId, {
        type,
        title: defaults.title || null,
        settings: defaults.settings,
        content: defaults.content,
        isActive: true,
      });
    },
    onSuccess: (block) => {
      addModal.close();
      setLocalBlocks((prev) => {
        const next = reindexBlocks([...prev, block]);
        setBaselineSnapshot(blocksSnapshot(next));
        return next;
      });
      setSelectedBlockId(block.id);
      setErrorMessage(null);
      onSuccess('Blok eklendi.');
      invalidate();
    },
    onError: (error) => {
      const message = onError(error, 'Blok eklenemedi.');
      setErrorMessage(message);
    },
  });

  const deleteBlockMutation = useMutation({
    mutationFn: async (blockId: string) => {
      if (!layoutId) throw new Error('Layout bulunamadı');
      await deleteLayoutBlock(layoutId, blockId);
      return blockId;
    },
    onSuccess: (blockId) => {
      deleteModal.close();
      setLocalBlocks((prev) => {
        const next = reindexBlocks(prev.filter((block) => block.id !== blockId));
        setBaselineSnapshot(blocksSnapshot(next));
        setSelectedBlockId((current) =>
          current === blockId ? (next[0]?.id ?? null) : current,
        );
        return next;
      });
      setBlockToDelete(null);
      setErrorMessage(null);
      onSuccess('Blok silindi.');
      invalidate();
    },
    onError: (error) => {
      const message = onError(error, 'Blok silinemedi.');
      setErrorMessage(message);
    },
  });

  const handleBlockChange = (updated: PageBlockDto) => {
    setLocalBlocks((prev) =>
      prev.map((block) => (block.id === updated.id ? updated : block)),
    );
  };

  const handleMoveUp = (blockId: string) => {
    setLocalBlocks((prev) => moveBlock(prev, blockId, -1));
  };

  const handleMoveDown = (blockId: string) => {
    setLocalBlocks((prev) => moveBlock(prev, blockId, 1));
  };

  const handleToggleActive = (blockId: string) => {
    setLocalBlocks((prev) =>
      prev.map((block) =>
        block.id === blockId ? { ...block, isActive: !block.isActive } : block,
      ),
    );
  };

  const handleDeleteRequest = (blockId: string) => {
    setBlockToDelete(blockId);
    deleteModal.open();
  };

  const isSaving = saveDraftMutation.isPending || publishMutation.isPending;

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader
          title="Sayfa Builder"
          description="Ana sayfa bloklarını düzenleyin. Değişiklikler taslak olarak kaydedilir; yayınladığınızda ziyaretçiler görür."
          action={
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default">Taslak</Badge>
              {isDirty ? <Badge variant="warning">Kaydedilmemiş</Badge> : null}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => window.open('/', '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
                Siteyi aç
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={addModal.open}
              >
                <Plus className="h-4 w-4" />
                Blok ekle
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={!isDirty || isSaving}
                onClick={() => saveDraftMutation.mutate()}
              >
                <Save className="h-4 w-4" />
                Taslak kaydet
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isSaving || !layoutId}
                onClick={() => publishMutation.mutate()}
              >
                <Upload className="h-4 w-4" />
                Yayınla
              </Button>
            </div>
          }
        />

        {errorMessage ? (
          <p className="border-t border-slate-100 px-4 py-2 text-sm text-red-600">
            {errorMessage}
          </p>
        ) : null}
      </Card>

      {layoutQuery.isLoading ? (
        <Card padding="none">
          <HomeLayoutSkeleton />
        </Card>
      ) : layoutQuery.isError ? (
        <Card>
          <p className="p-6 text-sm text-red-600">
            Sayfa düzeni yüklenemedi. API bağlantısını kontrol edin.
          </p>
        </Card>
      ) : (
        <div className="grid min-h-[calc(100vh-12rem)] grid-cols-1 gap-3 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
          <Card className="flex flex-col overflow-hidden" padding="none">
            <div className="border-b border-slate-100 px-4 py-3">
              <h2 className="text-sm font-semibold text-slate-800">Bloklar</h2>
              <p className="text-xs text-slate-500">
                {localBlocks.length} blok
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              <BlockListPanel
                blocks={localBlocks}
                selectedBlockId={selectedBlockId}
                onSelect={setSelectedBlockId}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                onToggleActive={handleToggleActive}
                onDelete={handleDeleteRequest}
              />
            </div>
          </Card>

          <Card className="flex flex-col overflow-hidden" padding="none">
            <div className="border-b border-slate-100 px-4 py-3">
              <h2 className="text-sm font-semibold text-slate-800">Önizleme</h2>
              <p className="text-xs text-slate-500">
                Aktif blokların mağaza görünümü
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              <BuilderPreview
                blocks={localBlocks}
                selectedBlockId={selectedBlockId}
                ready={initialized}
              />
            </div>
          </Card>

          <Card className="flex flex-col overflow-hidden" padding="none">
            <div className="border-b border-slate-100 px-4 py-3">
              <h2 className="text-sm font-semibold text-slate-800">
                Blok ayarları
              </h2>
              <p className="text-xs text-slate-500">
                Seçili bloğun içerik ve görünüm ayarları
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              <BlockSettingsPanel
                block={selectedBlock}
                onChange={handleBlockChange}
              />
            </div>
          </Card>
        </div>
      )}

      <AddBlockModal
        isOpen={addModal.isOpen}
        onClose={addModal.close}
        onSelect={(type) => addBlockMutation.mutate(type)}
        isPending={addBlockMutation.isPending}
      />

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Bloku sil"
        size="sm"
      >
        <p className="text-sm text-slate-600">
          Bu blok kalıcı olarak silinecek. Devam etmek istiyor musunuz?
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={deleteModal.close}>
            İptal
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={!blockToDelete || deleteBlockMutation.isPending}
            onClick={() => blockToDelete && deleteBlockMutation.mutate(blockToDelete)}
          >
            Sil
          </Button>
        </div>
      </Modal>
    </div>
  );
}
