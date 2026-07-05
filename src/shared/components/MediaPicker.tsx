import { useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ImageIcon, Upload } from 'lucide-react';
import type { MediaAssetDto, MediaTypeFilter } from '@/shared/types/api';
import {
  isImageMedia,
  listMedia,
  uploadMedia,
} from '@/shared/api/media.api';
import { Button, Input, Modal, Select } from '@/shared/ui';

export interface MediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (asset: MediaAssetDto) => void;
  /** Varsayılan: image */
  typeFilter?: MediaTypeFilter;
  folder?: string;
  title?: string;
}

export function MediaPicker({
  isOpen,
  onClose,
  onSelect,
  typeFilter = 'image',
  folder = 'general',
  title = 'Medya seç',
}: MediaPickerProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');

  const queryParams = useMemo(
    () => ({
      search: search || undefined,
      type: typeFilter,
      folder: folder || undefined,
    }),
    [search, typeFilter, folder],
  );

  const mediaQuery = useQuery({
    queryKey: ['admin', 'media', 'picker', queryParams],
    queryFn: () => listMedia(queryParams),
    enabled: isOpen,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadMedia(file, { folder }),
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
          <Select value={folder} disabled className="max-w-[140px]">
            <option value={folder}>{folder}</option>
          </Select>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            isLoading={uploadMutation.isPending}
          >
            <Upload className="h-4 w-4" />
            Yükle
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />

        {mediaQuery.isLoading ? (
          <p className="py-8 text-center text-sm text-slate-500">Yükleniyor…</p>
        ) : (
          <div className="grid max-h-[360px] grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
            {(mediaQuery.data?.items ?? []).map((asset) => (
              <button
                key={asset.id}
                type="button"
                onClick={() => handleSelect(asset)}
                className="overflow-hidden rounded-lg border border-slate-200 transition hover:border-slate-400"
              >
                <div className="flex aspect-square items-center justify-center bg-slate-50">
                  {isImageMedia(asset) ? (
                    <img
                      src={asset.url}
                      alt={asset.altText ?? asset.originalName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-slate-300" />
                  )}
                </div>
                <p className="truncate px-1.5 py-1 text-[11px] text-slate-700">
                  {asset.title || asset.originalName}
                </p>
              </button>
            ))}
          </div>
        )}

        {!mediaQuery.isLoading && (mediaQuery.data?.items.length ?? 0) === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">
            Medya bulunamadı. Yeni dosya yükleyin.
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
