import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { MailSettingDto } from '@/shared/types/api';
import { ApiError } from '@/shared/api/client';
import {
  getMailSettings,
  listMailLogs,
  listMailTemplates,
  MAIL_LOG_STATUS_LABELS,
  sendTestMail,
  updateMailSettings,
} from '@/shared/api/mail.api';
import { MailSettingsSubNav } from '@/admin/components/MailSettingsSubNav';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Input,
  Label,
  Select,
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/shared/ui';

export function MailSettingsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Partial<MailSettingDto>>({});
  const [smtpPass, setSmtpPass] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [testTemplateKey, setTestTemplateKey] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [testMessage, setTestMessage] = useState<string | null>(null);

  const settingsQuery = useQuery({
    queryKey: ['admin', 'mail-settings'],
    queryFn: getMailSettings,
  });

  const templatesQuery = useQuery({
    queryKey: ['admin', 'mail-templates'],
    queryFn: listMailTemplates,
  });

  const logsQuery = useQuery({
    queryKey: ['admin', 'mail-logs'],
    queryFn: () => listMailLogs(30),
  });

  useEffect(() => {
    if (settingsQuery.data) {
      setForm(settingsQuery.data);
    }
  }, [settingsQuery.data]);

  const saveMutation = useMutation({
    mutationFn: () =>
      updateMailSettings({
        smtpHost: form.smtpHost,
        smtpPort: form.smtpPort,
        smtpUser: form.smtpUser,
        ...(smtpPass ? { smtpPass } : {}),
        fromName: form.fromName,
        fromEmail: form.fromEmail,
        replyTo: form.replyTo,
        isActive: form.isActive,
      }),
    onSuccess: (data) => {
      setForm(data);
      setSmtpPass('');
      setMessage('Mail ayarları kaydedildi.');
      setErrorMessage(null);
      queryClient.invalidateQueries({ queryKey: ['admin', 'mail-settings'] });
    },
    onError: (error) => {
      setMessage(null);
      setErrorMessage(
        error instanceof ApiError ? error.message : 'Kayıt başarısız',
      );
    },
  });

  const testMutation = useMutation({
    mutationFn: () =>
      sendTestMail({
        toEmail: testEmail.trim(),
        templateKey: testTemplateKey || undefined,
      }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'mail-logs'] });
      if (result.sent) {
        setTestMessage('Test e-postası gönderildi.');
      } else if (result.skipped) {
        setTestMessage('Mail atlandı (ayarlar veya şablon pasif).');
      } else {
        setTestMessage(result.error ?? 'Gönderim başarısız.');
      }
    },
    onError: (error) => {
      setTestMessage(
        error instanceof ApiError ? error.message : 'Test maili gönderilemedi',
      );
    },
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    saveMutation.mutate();
  };

  if (settingsQuery.isLoading) {
    return <p className="text-sm text-slate-500">Yükleniyor…</p>;
  }

  return (
    <>
      <MailSettingsSubNav />

      <Card padding="sm" className="mb-4">
        <CardHeader
          title="SMTP Ayarları"
          description="E-posta gönderimi için sunucu yapılandırması"
        />

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>SMTP sunucu</Label>
            <Input
              value={form.smtpHost ?? ''}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, smtpHost: e.target.value }))
              }
              placeholder="smtp.example.com"
            />
          </div>
          <div>
            <Label>SMTP port</Label>
            <Input
              type="number"
              value={form.smtpPort ?? 587}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  smtpPort: Number(e.target.value),
                }))
              }
            />
          </div>
          <div>
            <Label>SMTP kullanıcı</Label>
            <Input
              value={form.smtpUser ?? ''}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, smtpUser: e.target.value }))
              }
            />
          </div>
          <div>
            <Label>
              SMTP şifre
              {form.hasSmtpPass ? (
                <span className="ml-2 text-xs font-normal text-slate-500">
                  (kayıtlı — değiştirmek için yeni girin)
                </span>
              ) : null}
            </Label>
            <Input
              type="password"
              value={smtpPass}
              onChange={(e) => setSmtpPass(e.target.value)}
              placeholder={form.hasSmtpPass ? '••••••••' : ''}
            />
          </div>
          <div>
            <Label>Gönderen adı</Label>
            <Input
              value={form.fromName ?? ''}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, fromName: e.target.value }))
              }
            />
          </div>
          <div>
            <Label>Gönderen e-posta</Label>
            <Input
              type="email"
              value={form.fromEmail ?? ''}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, fromEmail: e.target.value }))
              }
            />
          </div>
          <div className="md:col-span-2">
            <Label>Yanıt adresi (opsiyonel)</Label>
            <Input
              type="email"
              value={form.replyTo ?? ''}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  replyTo: e.target.value || null,
                }))
              }
            />
          </div>
          <div className="md:col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isActive ?? false}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, isActive: e.target.checked }))
              }
            />
            <Label>Mail gönderimi aktif</Label>
          </div>

          {message ? (
            <p className="md:col-span-2 text-sm text-green-600">{message}</p>
          ) : null}
          {errorMessage ? (
            <p className="md:col-span-2 text-sm text-red-600">{errorMessage}</p>
          ) : null}

          <div className="md:col-span-2">
            <Button type="submit" disabled={saveMutation.isPending}>
              Kaydet
            </Button>
          </div>
        </form>
      </Card>

      <Card padding="sm" className="mb-4">
        <CardHeader
          title="Test e-postası"
          description="SMTP ayarlarını veya seçili şablonu test edin"
        />
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label>Alıcı e-posta</Label>
            <Input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="test@example.com"
            />
          </div>
          <div>
            <Label>Şablon (opsiyonel)</Label>
            <Select
              value={testTemplateKey}
              onChange={(e) => setTestTemplateKey(e.target.value)}
            >
              <option value="">Basit test maili</option>
              {(templatesQuery.data ?? []).map((template) => (
                <option key={template.id} value={template.key}>
                  {template.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
        {testMessage ? (
          <p className="mt-3 text-sm text-slate-600">{testMessage}</p>
        ) : null}
        <Button
          size="sm"
          className="mt-3"
          disabled={testMutation.isPending || !testEmail.trim()}
          onClick={() => testMutation.mutate()}
        >
          Test gönder
        </Button>
      </Card>

      <Card padding="sm">
        <CardHeader title="Son mail kayıtları" />
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Tarih</TableHeaderCell>
              <TableHeaderCell>Alıcı</TableHeaderCell>
              <TableHeaderCell>Konu</TableHeaderCell>
              <TableHeaderCell>Şablon</TableHeaderCell>
              <TableHeaderCell>Durum</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logsQuery.isLoading ? (
              <TableEmpty colSpan={5} message="Yükleniyor…" />
            ) : (logsQuery.data?.length ?? 0) === 0 ? (
              <TableEmpty colSpan={5} message="Henüz mail kaydı yok." />
            ) : (
              logsQuery.data!.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-slate-500">
                    {new Date(log.createdAt).toLocaleString('tr-TR')}
                  </TableCell>
                  <TableCell>{log.toEmail}</TableCell>
                  <TableCell className="max-w-xs truncate">{log.subject}</TableCell>
                  <TableCell>{log.templateKey ?? '—'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        log.status === 'SENT'
                          ? 'success'
                          : log.status === 'FAILED'
                            ? 'danger'
                            : 'default'
                      }
                    >
                      {MAIL_LOG_STATUS_LABELS[log.status]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
