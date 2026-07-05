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
import {
  Button,
  Card,
  CardHeader,
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
} from '@/shared/ui';

const emptyForm = {
  sourcePath: '',
  targetPath: '',
  statusCode: 301 as 301 | 302,
  isActive: true,
};

export function RedirectRulesPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RedirectRuleDto | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    mutationFn: deleteRedirectRule,
    onSuccess: invalidate,
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

  return (
    <>
      <Card padding="sm">
        <CardHeader
          title="301 / 302 yönlendirmeler"
          description="Eski URL'leri yeni adreslere yönlendirin"
          action={
            <Button size="sm" onClick={openCreate}>
              <Plus className="mr-1 h-4 w-4" />
              Yeni kural
            </Button>
          }
        />

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
            {rulesQuery.isLoading ? (
              <TableEmpty colSpan={5} message="Yükleniyor…" />
            ) : (rulesQuery.data?.length ?? 0) === 0 ? (
              <TableEmpty colSpan={5} message="Henüz yönlendirme kuralı yok." />
            ) : (
              rulesQuery.data!.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-mono text-sm">
                    {rule.sourcePath}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {rule.targetPath}
                  </TableCell>
                  <TableCell>{rule.statusCode}</TableCell>
                  <TableCell>
                    {rule.isActive ? 'Aktif' : 'Pasif'}
                  </TableCell>
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
                          if (
                            window.confirm(
                              'Bu yönlendirme kuralını silmek istiyor musunuz?',
                            )
                          ) {
                            deleteMutation.mutate(rule.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

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
    </>
  );
}
