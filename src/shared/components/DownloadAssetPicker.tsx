import { useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FileIcon, Upload } from 'lucide-react';
import type { MediaAssetDto } from '@/shared/types/api';
import {
  formatMediaSize,
  isDownloadMedia,
  listMedia,
  uploadDownloadMedia,
} from '@/shared/api/media.api';
import { Button, Input, Modal } from '@/shared/ui';

export interface DownloadAssetPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (asset: MediaAssetDto) => void;
  folder?: string;
  title?: string;
}

export function DownloadAssetPicker({
  isOpen,
  onClose,
  onSelect,
  folder = 'products',
  title = 'İndirilebilir dosya seç',
}: DownloadAssetPickerProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');

  const queryParams = useMemo(
    () => ({
      search: search || undefined,
      library: 'downloads' as const,
      folder: folder || undefined,
    }),
    [search, folder],
  );

  const mediaQuery = useQuery({
    queryKey: ['admin', 'media', 'download-picker', queryParams],
    queryFn: () => listMedia(queryParams),
    enabled: isOpen,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadDownloadMedia(file, { folder }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'media'] });
    },
  });

  const handleSelect = (asset: MediaAssetDto) => {
    onSelect(asset);
    onClose();
  };

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    uploadMutation.mutate(file, {
      onSuccess: (asset) => handleSelect(asset),
    });
    event.target.value = '';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Ara…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="min-w-[180px] flex-1"
          />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            isLoading={uploadMutation.isPending}
          >
            <Upload className="h-4 w-4" />
            Dosya yükle
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".exe,.zip,.msi,.7z,.rar,application/zip,application/x-msdownload,application/octet-stream"
          className="hidden"
          onChange={handleUpload}
        />

        {mediaQuery.isLoading ? (
          <p className="py-8 text-center text-sm text-slate-500">Yükleniyor…</p>
        ) : (
          <div className="max-h-[360px] space-y-2 overflow-y-auto">
            {(mediaQuery.data?.items ?? []).map((asset) => (
              <button
                key={asset.id}
                type="button"
                onClick={() => handleSelect(asset)}
                className="flex w-full items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-left transition hover:border-slate-400"
              >
                <FileIcon className="h-5 w-5 shrink-0 text-slate-400" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {asset.originalName}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {formatMediaSize(asset.size)} · {asset.mimeType}
                    {isDownloadMedia(asset) ? ` · ${asset.storageKey}` : ''}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {!mediaQuery.isLoading && (mediaQuery.data?.items.length ?? 0) === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">
            İndirilebilir dosya bulunamadı. EXE/ZIP yükleyin.
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
