import { useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Grid3X3,
  ImageIcon,
  List,
  Trash2,
  Upload,
} from 'lucide-react';
import type { MediaAssetDto, MediaTypeFilter } from '@/shared/types/api';
import { ApiError } from '@/shared/api/client';
import {
  deleteMedia,
  formatMediaSize,
  isImageMedia,
  listMedia,
  listMediaFolders,
  updateMedia,
  uploadMedia,
} from '@/shared/api/media.api';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Drawer,
  FilterBar,
  Input,
  Label,
  Modal,
  Select,
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeaderCell,
  TableRow,
  Textarea,
} from '@/shared/ui';

type ViewMode = 'grid' | 'list';

export function MediaPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState('');
  const [typeFilter, setTypeFilter] = useState<MediaTypeFilter | ''>('');
  const [selected, setSelected] = useState<MediaAssetDto | null>(null);
  const [detailForm, setDetailForm] = useState({
    title: '',
    altText: '',
    folder: '',
  });
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const detailDrawer = useDisclosure();
  const deleteModal = useDisclosure();

  const queryParams = useMemo(
    () => ({
      search: search || undefined,
      folder: folder || undefined,
      type: typeFilter || undefined,
    }),
    [search, folder, typeFilter],
  );

  const mediaQuery = useQuery({
    queryKey: ['admin', 'media', queryParams],
    queryFn: () => listMedia(queryParams),
  });

  const foldersQuery = useQuery({
    queryKey: ['admin', 'media', 'folders'],
    queryFn: listMediaFolders,
  });

  const invalidateMedia = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'media'] });
  };

  const uploadMutation = useMutation({
    mutationFn: (files: FileList) =>
      Promise.all(
        Array.from(files).map((file) =>
          uploadMedia(file, { folder: folder || 'general' }),
        ),
      ),
    onSuccess: () => {
      invalidateMedia();
      setMessage('Dosya(lar) yüklendi.');
      setErrorMessage(null);
    },
    onError: (error) => {
      setMessage(null);
      setErrorMessage(
        error instanceof ApiError ? error.message : 'Yükleme başarısız',
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateMedia(selected!.id, {
        title: detailForm.title || null,
        altText: detailForm.altText || null,
        folder: detailForm.folder || selected!.folder,
      }),
    onSuccess: (data) => {
      setSelected(data);
      invalidateMedia();
      setMessage('Medya güncellendi.');
      setErrorMessage(null);
    },
    onError: (error) => {
      setErrorMessage(
        error instanceof ApiError ? error.message : 'Güncelleme başarısız',
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteMedia(selected!.id),
    onSuccess: () => {
      invalidateMedia();
      deleteModal.close();
      detailDrawer.close();
      setSelected(null);
      setMessage('Medya silindi.');
      setErrorMessage(null);
    },
    onError: (error) => {
      setErrorMessage(
        error instanceof ApiError ? error.message : 'Silme başarısız',
      );
    },
  });

  const openDetail = (asset: MediaAssetDto) => {
    setSelected(asset);
    setDetailForm({
      title: asset.title ?? '',
      altText: asset.altText ?? '',
      folder: asset.folder,
    });
    detailDrawer.open();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;
    uploadMutation.mutate(files);
    event.target.value = '';
  };

  const folderOptions = [
    { value: '', label: 'Tüm klasörler' },
    ...(foldersQuery.data ?? []).map((item) => ({ value: item, label: item })),
  ];

  return (
    <>
      <Card padding="sm">
        <CardHeader
          title="Medya Kütüphanesi"
          description="Görselleri yükleyin, düzenleyin ve yönetin"
          action={
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={viewMode === 'grid' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={viewMode === 'list' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                isLoading={uploadMutation.isPending}
              >
                <Upload className="h-4 w-4" />
                Yükle
              </Button>
            </div>
          }
        />

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,audio/*,application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />

        <FilterBar
          className="mb-4"
          searchValue={search}
          onSearchChange={setSearch}
        >
          <Select
            value={folder}
            onChange={(event) => setFolder(event.target.value)}
            className="max-w-[180px]"
          >
            {folderOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value as MediaTypeFilter | '')
            }
            className="max-w-[160px]"
          >
            <option value="">Tüm türler</option>
            <option value="image">Görsel</option>
            <option value="video">Video</option>
            <option value="audio">Ses</option>
            <option value="document">Belge</option>
            <option value="other">Diğer</option>
          </Select>
        </FilterBar>

        {message ? (
          <p className="mb-3 text-sm text-emerald-600">{message}</p>
        ) : null}
        {errorMessage ? (
          <p className="mb-3 text-sm text-red-600">{errorMessage}</p>
        ) : null}

        {mediaQuery.isLoading ? (
          <p className="text-sm text-slate-500">Yükleniyor…</p>
        ) : viewMode === 'grid' ? (
          <MediaGrid
            items={mediaQuery.data?.items ?? []}
            onSelect={openDetail}
          />
        ) : (
          <MediaListTable
            items={mediaQuery.data?.items ?? []}
            onSelect={openDetail}
          />
        )}
      </Card>

      <Drawer
        isOpen={detailDrawer.isOpen}
        onClose={detailDrawer.close}
        title="Medya detayı"
        footer={
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => updateMutation.mutate()}
              isLoading={updateMutation.isPending}
            >
              Kaydet
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={deleteModal.open}
            >
              <Trash2 className="h-4 w-4" />
              Sil
            </Button>
          </div>
        }
      >
        {selected ? (
          <MediaDetailForm
            asset={selected}
            form={detailForm}
            onChange={setDetailForm}
          />
        ) : null}
      </Drawer>

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Medyayı sil"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={deleteModal.close}>
              İptal
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteMutation.mutate()}
              isLoading={deleteMutation.isPending}
            >
              Sil
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          <strong>{selected?.originalName}</strong> kalıcı olarak silinecek.
        </p>
      </Modal>
    </>
  );
}

function MediaGrid({
  items,
  onSelect,
}: {
  items: MediaAssetDto[];
  onSelect: (asset: MediaAssetDto) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 py-16 text-center text-sm text-slate-500">
        Henüz medya yok. Yükle butonu ile dosya ekleyin.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {items.map((asset) => (
        <button
          key={asset.id}
          type="button"
          onClick={() => onSelect(asset)}
          className="group overflow-hidden rounded-lg border border-slate-200 bg-white text-left transition hover:border-slate-300 hover:shadow-sm"
        >
          <div className="flex aspect-square items-center justify-center bg-slate-50">
            {isImageMedia(asset) ? (
              <img
                src={asset.url}
                alt={asset.altText ?? asset.originalName}
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageIcon className="h-8 w-8 text-slate-300" />
            )}
          </div>
          <div className="p-2">
            <p className="truncate text-xs font-medium text-slate-800">
              {asset.title || asset.originalName}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              {formatMediaSize(asset.size)}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}

function MediaListTable({
  items,
  onSelect,
}: {
  items: MediaAssetDto[];
  onSelect: (asset: MediaAssetDto) => void;
}) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Önizleme</TableHeaderCell>
          <TableHeaderCell>Dosya</TableHeaderCell>
          <TableHeaderCell>Klasör</TableHeaderCell>
          <TableHeaderCell>Tür</TableHeaderCell>
          <TableHeaderCell>Boyut</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {items.length === 0 ? (
          <TableEmpty colSpan={5} message="Medya bulunamadı" />
        ) : (
          items.map((asset) => (
            <TableRow
              key={asset.id}
              className="cursor-pointer"
              onClick={() => onSelect(asset)}
            >
              <TableCell>
                {isImageMedia(asset) ? (
                  <img
                    src={asset.url}
                    alt=""
                    className="h-10 w-10 rounded object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-slate-100">
                    <ImageIcon className="h-4 w-4 text-slate-400" />
                  </div>
                )}
              </TableCell>
              <TableCell>
                <p className="font-medium text-slate-900">
                  {asset.title || asset.originalName}
                </p>
                <p className="text-xs text-slate-500">{asset.fileName}</p>
              </TableCell>
              <TableCell>
                <Badge>{asset.folder}</Badge>
              </TableCell>
              <TableCell className="text-xs text-slate-500">
                {asset.mimeType}
              </TableCell>
              <TableCell className="text-xs text-slate-500">
                {formatMediaSize(asset.size)}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

function MediaDetailForm({
  asset,
  form,
  onChange,
}: {
  asset: MediaAssetDto;
  form: { title: string; altText: string; folder: string };
  onChange: (form: { title: string; altText: string; folder: string }) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
        {isImageMedia(asset) ? (
          <img
            src={asset.url}
            alt={form.altText || asset.originalName}
            className="max-h-48 w-full object-contain"
          />
        ) : (
          <div className="flex h-32 items-center justify-center">
            <ImageIcon className="h-10 w-10 text-slate-300" />
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="media-title">Başlık</Label>
        <Input
          id="media-title"
          value={form.title}
          onChange={(event) =>
            onChange({ ...form, title: event.target.value })
          }
        />
      </div>

      <div>
        <Label htmlFor="media-alt">Alt metin</Label>
        <Textarea
          id="media-alt"
          rows={3}
          value={form.altText}
          onChange={(event) =>
            onChange({ ...form, altText: event.target.value })
          }
        />
      </div>

      <div>
        <Label htmlFor="media-folder">Klasör</Label>
        <Input
          id="media-folder"
          value={form.folder}
          onChange={(event) =>
            onChange({ ...form, folder: event.target.value })
          }
        />
      </div>

      <dl className="space-y-2 text-xs text-slate-500">
        <div className="flex justify-between gap-4">
          <dt>Orijinal ad</dt>
          <dd className="text-right text-slate-700">{asset.originalName}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>URL</dt>
          <dd className="truncate text-right text-slate-700">{asset.url}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Boyut</dt>
          <dd>{formatMediaSize(asset.size)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Tür</dt>
          <dd>{asset.mimeType}</dd>
        </div>
      </dl>
    </div>
  );
}
