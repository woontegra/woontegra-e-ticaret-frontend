import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FileIcon,
  Grid3X3,
  ImageIcon,
  List,
  Trash2,
  Upload,
} from 'lucide-react';
import type { MediaAssetDto, MediaLibraryFilter, MediaTypeFilter } from '@/shared/types/api';
import {
  deleteMedia,
  formatMediaSize,
  isDownloadMedia,
  isImageMedia,
  listMedia,
  listMediaFolders,
  updateMedia,
  uploadDownloadMedia,
  uploadMedia,
} from '@/shared/api/media.api';
import { AdminPanel } from '@/admin/components/AdminPanel';
import { TableQueryState } from '@/admin/components/TableQueryState';
import { useAdminMutationFeedback } from '@/admin/hooks/useAdminMutationFeedback';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import {
  Badge,
  Button,
  ConfirmDialog,
  Drawer,
  FilterBar,
  Input,
  Label,
  Pagination,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Textarea,
} from '@/shared/ui';

const PAGE_SIZE = 24;

type ViewMode = 'grid' | 'list';

export function MediaPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const downloadInputRef = useRef<HTMLInputElement>(null);
  const { onSuccess, onError } = useAdminMutationFeedback();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState('');
  const [typeFilter, setTypeFilter] = useState<MediaTypeFilter | ''>('');
  const [libraryTab, setLibraryTab] = useState<MediaLibraryFilter>('images');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<MediaAssetDto | null>(null);
  const [detailForm, setDetailForm] = useState({
    title: '',
    altText: '',
    folder: '',
  });

  const detailDrawer = useDisclosure();
  const deleteModal = useDisclosure();

  const queryParams = useMemo(
    () => ({
      search: search || undefined,
      folder: folder || undefined,
      type: libraryTab === 'images' ? typeFilter || undefined : undefined,
      library: libraryTab,
      page,
      limit: PAGE_SIZE,
    }),
    [search, folder, typeFilter, libraryTab, page],
  );

  const mediaQuery = useQuery({
    queryKey: ['admin', 'media', queryParams],
    queryFn: () => listMedia(queryParams),
  });

  const foldersQuery = useQuery({
    queryKey: ['admin', 'media', 'folders'],
    queryFn: listMediaFolders,
  });

  const items = mediaQuery.data?.items ?? [];
  const total = mediaQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [search, folder, typeFilter, libraryTab]);

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
      onSuccess('Görsel(ler) yüklendi.');
    },
    onError: (error) => onError(error, 'Yükleme başarısız'),
  });

  const uploadDownloadMutation = useMutation({
    mutationFn: (files: FileList) =>
      Promise.all(
        Array.from(files).map((file) =>
          uploadDownloadMedia(file, { folder: folder || 'products' }),
        ),
      ),
    onSuccess: () => {
      invalidateMedia();
      onSuccess('İndirilebilir dosya(lar) yüklendi.');
    },
    onError: (error) => onError(error, 'Yükleme başarısız'),
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
      onSuccess('Medya güncellendi.');
    },
    onError: (error) => onError(error, 'Güncelleme başarısız'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteMedia(selected!.id),
    onSuccess: () => {
      invalidateMedia();
      deleteModal.close();
      detailDrawer.close();
      setSelected(null);
      onSuccess('Medya silindi.');
    },
    onError: (error) => onError(error, 'Silme başarısız'),
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

  const handleDownloadFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files?.length) return;
    uploadDownloadMutation.mutate(files);
    event.target.value = '';
  };

  const isDownloadTab = libraryTab === 'downloads';

  const folderOptions = [
    { value: '', label: 'Tüm klasörler' },
    ...(foldersQuery.data ?? []).map((item) => ({ value: item, label: item })),
  ];

  return (
    <>
      <AdminPanel
        actions={
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
              onClick={() =>
                isDownloadTab
                  ? downloadInputRef.current?.click()
                  : fileInputRef.current?.click()
              }
              isLoading={
                uploadMutation.isPending || uploadDownloadMutation.isPending
              }
            >
              <Upload className="h-4 w-4" />
              {isDownloadTab ? 'Dosya yükle' : 'Görsel yükle'}
            </Button>
          </div>
        }
        filters={
          <FilterBar searchValue={search} onSearchChange={setSearch}>
            <Select
              value={libraryTab}
              onChange={(event) =>
                setLibraryTab(event.target.value as MediaLibraryFilter)
              }
              className="h-8 max-w-[180px] text-xs"
            >
              <option value="images">Görseller</option>
              <option value="downloads">İndirilebilir Dosyalar</option>
              <option value="documents">Dokümanlar</option>
              <option value="all">Tümü</option>
            </Select>
            <Select
              value={folder}
              onChange={(event) => setFolder(event.target.value)}
              className="h-8 max-w-[180px] text-xs"
            >
              {folderOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            {libraryTab === 'images' ? (
              <Select
                value={typeFilter}
                onChange={(event) =>
                  setTypeFilter(event.target.value as MediaTypeFilter | '')
                }
                className="h-8 max-w-[160px] text-xs"
              >
                <option value="">Tüm türler</option>
                <option value="image">Görsel</option>
                <option value="video">Video</option>
                <option value="audio">Ses</option>
                <option value="document">Belge</option>
                <option value="other">Diğer</option>
              </Select>
            ) : null}
          </FilterBar>
        }
        footer={
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        }
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,audio/*,application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          ref={downloadInputRef}
          type="file"
          multiple
          accept=".exe,.zip,.msi,.7z,.rar,application/zip,application/x-msdownload,application/octet-stream"
          className="hidden"
          onChange={handleDownloadFileChange}
        />

        {mediaQuery.isLoading ? (
          <p className="px-3 py-8 text-center text-sm text-slate-500">
            Yükleniyor…
          </p>
        ) : mediaQuery.isError ? (
          <p className="px-3 py-8 text-center text-sm text-red-600">
            Veriler yüklenemedi.
          </p>
        ) : viewMode === 'grid' ? (
          <MediaGrid
            items={items}
            isEmpty={items.length === 0}
            onSelect={openDetail}
          />
        ) : (
          <MediaListTable
            items={items}
            isLoading={mediaQuery.isLoading}
            isError={mediaQuery.isError}
            onSelect={openDetail}
          />
        )}
      </AdminPanel>

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

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Medyayı sil"
        description={
          selected
            ? `"${selected.originalName}" kalıcı olarak silinecek.`
            : 'Bu medya kalıcı olarak silinecek.'
        }
        confirmLabel="Sil"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />
    </>
  );
}

function MediaGrid({
  items,
  isEmpty,
  onSelect,
}: {
  items: MediaAssetDto[];
  isEmpty: boolean;
  onSelect: (asset: MediaAssetDto) => void;
}) {
  if (isEmpty) {
    return (
      <div className="px-3 py-16 text-center text-sm text-slate-500">
        Henüz medya yok. Yükle butonu ile dosya ekleyin.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {items.map((asset) => (
        <button
          key={asset.id}
          type="button"
          onClick={() => onSelect(asset)}
          className="group overflow-hidden rounded-lg border border-slate-200 bg-white text-left transition hover:border-slate-300 hover:shadow-sm"
        >
          <div className="flex aspect-square items-center justify-center bg-slate-50">
            {isImageMedia(asset) && asset.url ? (
              <img
                src={asset.url}
                alt={asset.altText ?? asset.originalName}
                className="h-full w-full object-cover"
              />
            ) : isDownloadMedia(asset) ? (
              <FileIcon className="h-8 w-8 text-slate-400" />
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
  isLoading,
  isError,
  onSelect,
}: {
  items: MediaAssetDto[];
  isLoading: boolean;
  isError: boolean;
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
        <TableQueryState
          colSpan={5}
          isLoading={isLoading}
          isError={isError}
          isEmpty={items.length === 0}
          emptyMessage="Medya bulunamadı"
        >
          {items.map((asset) => (
            <TableRow
              key={asset.id}
              className="cursor-pointer"
              onClick={() => onSelect(asset)}
            >
              <TableCell>
                {isImageMedia(asset) && asset.url ? (
                  <img
                    src={asset.url}
                    alt=""
                    className="h-10 w-10 rounded object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-slate-100">
                    {isDownloadMedia(asset) ? (
                      <FileIcon className="h-4 w-4 text-slate-500" />
                    ) : (
                      <ImageIcon className="h-4 w-4 text-slate-400" />
                    )}
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
          ))}
        </TableQueryState>
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
        {isImageMedia(asset) && asset.url ? (
          <img
            src={asset.url}
            alt={form.altText || asset.originalName}
            className="max-h-48 w-full object-contain"
          />
        ) : (
          <div className="flex h-32 items-center justify-center">
            {isDownloadMedia(asset) ? (
              <FileIcon className="h-10 w-10 text-slate-400" />
            ) : (
              <ImageIcon className="h-10 w-10 text-slate-300" />
            )}
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
          <dt>Depolama</dt>
          <dd className="text-right text-slate-700">
            {asset.storageProvider}
            {asset.usageType ? ` · ${asset.usageType}` : ''}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Storage key</dt>
          <dd className="truncate text-right font-mono text-slate-700">
            {asset.storageKey}
          </dd>
        </div>
        {asset.url ? (
          <div className="flex justify-between gap-4">
            <dt>URL</dt>
            <dd className="truncate text-right text-slate-700">{asset.url}</dd>
          </div>
        ) : null}
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
