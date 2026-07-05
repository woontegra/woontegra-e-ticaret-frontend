import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { RedirectRuleDto } from '@/shared/types/api';
import { ApiError } from '@/shared/api/client';
import {
  createRedirectRule,
  deleteRedirectRule,
  listRedirectRules,
  updateRedirectRule,
} from '@/shared/api/seo.api';
import { AdminPanel } from '@/admin/components/AdminPanel';
import { TableQueryState } from '@/admin/components/TableQueryState';
import { useAdminMutationFeedback } from '@/admin/hooks/useAdminMutationFeedback';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import {
  Button,
  ConfirmDialog,
  Input,
  Label,
  Modal,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/shared/ui';

const emptyForm = {
  sourcePath: '',
  targetPath: '',
  statusCode: 301 as 301 | 302,
  isActive: true,
};

export function RedirectRulesPage() {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = useAdminMutationFeedback();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RedirectRuleDto | null>(null);
  const [toDelete, setToDelete] = useState<RedirectRuleDto | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const deleteModal = useDisclosure();

  const rulesQuery = useQuery({
    queryKey: ['admin', 'redirect-rules'],
    queryFn: listRedirectRules,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'redirect-rules'] });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        return updateRedirectRule(editing.id, form);
      }
      return createRedirectRule(form);
    },
    onSuccess: () => {
      invalidate();
      setModalOpen(false);
      setEditing(null);
      setForm(emptyForm);
      setErrorMessage(null);
    },
    onError: (error) => {
      setErrorMessage(
        error instanceof ApiError ? error.message : 'Kayıt başarısız',
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteRedirectRule(toDelete!.id),
    onSuccess: () => {
      invalidate();
      deleteModal.close();
      setToDelete(null);
      onSuccess('Yönlendirme kuralı silindi.');
    },
    onError: (error) => onError(error, 'Kural silinemedi.'),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrorMessage(null);
    setModalOpen(true);
  };

  const openEdit = (rule: RedirectRuleDto) => {
    setEditing(rule);
    setForm({
      sourcePath: rule.sourcePath,
      targetPath: rule.targetPath,
      statusCode: rule.statusCode,
      isActive: rule.isActive,
    });
    setErrorMessage(null);
    setModalOpen(true);
  };

  const items = rulesQuery.data ?? [];

  return (
    <>
      <AdminPanel
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Yeni kural
          </Button>
        }
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Kaynak</TableHeaderCell>
              <TableHeaderCell>Hedef</TableHeaderCell>
              <TableHeaderCell>Kod</TableHeaderCell>
              <TableHeaderCell>Durum</TableHeaderCell>
              <TableHeaderCell className="text-right">İşlem</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableQueryState
              colSpan={5}
              isLoading={rulesQuery.isLoading}
              isError={rulesQuery.isError}
              isEmpty={items.length === 0}
              emptyMessage="Henüz yönlendirme kuralı yok."
            >
              {items.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-mono text-sm">
                    {rule.sourcePath}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {rule.targetPath}
                  </TableCell>
                  <TableCell>{rule.statusCode}</TableCell>
                  <TableCell>{rule.isActive ? 'Aktif' : 'Pasif'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(rule)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setToDelete(rule);
                          deleteModal.open();
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableQueryState>
          </TableBody>
        </Table>
      </AdminPanel>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Yönlendirme düzenle' : 'Yeni yönlendirme'}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="redirect-source">Kaynak yol</Label>
            <Input
              id="redirect-source"
              placeholder="/eski-url"
              value={form.sourcePath}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, sourcePath: e.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="redirect-target">Hedef</Label>
            <Input
              id="redirect-target"
              placeholder="/yeni-url veya https://..."
              value={form.targetPath}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, targetPath: e.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="redirect-code">HTTP kodu</Label>
            <Select
              id="redirect-code"
              value={String(form.statusCode)}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  statusCode: Number(e.target.value) as 301 | 302,
                }))
              }
            >
              <option value="301">301 Kalıcı</option>
              <option value="302">302 Geçici</option>
            </Select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, isActive: e.target.checked }))
              }
            />
            Aktif
          </label>
          {errorMessage ? (
            <p className="text-sm text-red-600">{errorMessage}</p>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              İptal
            </Button>
            <Button
              disabled={saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
            >
              Kaydet
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Yönlendirme kuralını sil"
        description={
          toDelete
            ? `"${toDelete.sourcePath}" → "${toDelete.targetPath}" kalıcı olarak silinecek.`
            : 'Bu yönlendirme kuralı kalıcı olarak silinecek.'
        }
        confirmLabel="Sil"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />
    </>
  );
}
