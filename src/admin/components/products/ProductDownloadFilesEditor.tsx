import type {
  ProductDownloadFile,
  ProductDownloadFilesConfig,
} from '@/shared/types/api';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import {
  fileHasAsset,
  productDownloadFileFromAsset,
} from '@/shared/lib/productDownloadFiles';
import { DownloadAssetPicker } from '@/shared/components/DownloadAssetPicker';
import { Button, Input, Label } from '@/shared/ui';

interface ProductDownloadFilesEditorProps {
  value: ProductDownloadFilesConfig;
  onChange: (value: ProductDownloadFilesConfig) => void;
  showPaymentFlags?: boolean;
}

function updateFile(
  files: ProductDownloadFile[],
  index: number,
  patch: Partial<ProductDownloadFile>,
): ProductDownloadFile[] {
  return files.map((file, i) => (i === index ? { ...file, ...patch } : file));
}

function DownloadFileRow({
  file,
  index,
  files,
  value,
  onChange,
}: {
  file: ProductDownloadFile;
  index: number;
  files: ProductDownloadFile[];
  value: ProductDownloadFilesConfig;
  onChange: (value: ProductDownloadFilesConfig) => void;
}) {
  const picker = useDisclosure();

  const clearFile = () => {
    onChange({
      ...value,
      files: updateFile(files, index, {
        mediaAssetId: undefined,
        storageProvider: undefined,
        storageKey: undefined,
        fileName: undefined,
        originalName: undefined,
        mimeType: undefined,
        size: '',
        url: '',
      }),
    });
  };

  return (
    <div className="rounded-lg border border-[rgb(var(--admin-border))] bg-[rgb(var(--admin-surface-muted))] p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-[rgb(var(--admin-text))]">
          {file.label || file.type || `Dosya ${index + 1}`}
        </p>
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="secondary" onClick={picker.open}>
            {fileHasAsset(file) ? 'Dosyayı değiştir' : 'Dosya seç'}
          </Button>
          {fileHasAsset(file) ? (
            <Button type="button" size="sm" variant="ghost" onClick={clearFile}>
              Kaldır
            </Button>
          ) : null}
        </div>
      </div>

      {fileHasAsset(file) ? (
        <div className="mb-3 rounded border border-[rgb(var(--admin-border))] bg-white px-3 py-2 text-xs text-[rgb(var(--admin-text-muted))]">
          <p className="font-medium text-[rgb(var(--admin-text))]">
            {file.originalName || file.fileName}
          </p>
          <p>{file.size} · {file.mimeType}</p>
          <p className="truncate font-mono">{file.storageKey}</p>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Buton metni</Label>
          <Input
            value={file.buttonLabel ?? ''}
            onChange={(e) =>
              onChange({
                ...value,
                files: updateFile(files, index, {
                  buttonLabel: e.target.value,
                }),
              })
            }
          />
        </div>
        <div>
          <Label>Sürüm</Label>
          <Input
            value={file.version ?? ''}
            onChange={(e) =>
              onChange({
                ...value,
                files: updateFile(files, index, { version: e.target.value }),
              })
            }
          />
        </div>
        <div>
          <Label>SHA256</Label>
          <Input
            value={file.sha256 ?? ''}
            onChange={(e) =>
              onChange({
                ...value,
                files: updateFile(files, index, { sha256: e.target.value }),
              })
            }
            className="font-mono text-xs"
            placeholder="Opsiyonel"
          />
        </div>
      </div>

      <DownloadAssetPicker
        isOpen={picker.isOpen}
        onClose={picker.close}
        folder="products"
        title={`${file.label} dosyası seç`}
        onSelect={(asset) => {
          onChange({
            ...value,
            files: updateFile(
              files,
              index,
              productDownloadFileFromAsset(asset, {
                label: file.label,
                type: file.type,
                buttonLabel: file.buttonLabel,
                version: file.version,
              }),
            ),
          });
        }}
      />
    </div>
  );
}

export function ProductDownloadFilesEditor({
  value,
  onChange,
  showPaymentFlags = true,
}: ProductDownloadFilesEditorProps) {
  const files = value.files ?? [];

  const addFile = () => {
    onChange({
      ...value,
      files: [
        ...files,
        {
          label: 'Ek dosya',
          type: 'other',
          url: '',
          buttonLabel: 'İndir',
        },
      ],
    });
  };

  return (
    <div className="space-y-4">
      {showPaymentFlags ? (
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={value.publicFreeDownload ?? false}
              onChange={(e) =>
                onChange({ ...value, publicFreeDownload: e.target.checked })
              }
            />
            Herkese açık ücretsiz indirme
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={value.showAfterPaymentOnly ?? true}
              onChange={(e) =>
                onChange({ ...value, showAfterPaymentOnly: e.target.checked })
              }
            />
            Yalnızca ödeme sonrası göster
          </label>
        </div>
      ) : null}

      <div>
        <Label>Paket sürümü</Label>
        <Input
          value={value.version ?? ''}
          onChange={(e) => onChange({ ...value, version: e.target.value })}
          placeholder="1.0.0"
        />
      </div>

      {files.map((file, index) => (
        <DownloadFileRow
          key={`${file.type ?? file.label}-${index}`}
          file={file}
          index={index}
          files={files}
          value={value}
          onChange={onChange}
        />
      ))}

      <Button type="button" variant="secondary" size="sm" onClick={addFile}>
        Dosya ekle
      </Button>

      <p className="text-xs text-[rgb(var(--admin-text-muted))]">
        İndirilebilir dosyalar Cloudflare R2 private bucket&apos;a yüklenir.
        Public siteye doğrudan R2 URL verilmez; indirme sonraki fazda tokenlı
        endpoint üzerinden sağlanacak.
      </p>
    </div>
  );
}
