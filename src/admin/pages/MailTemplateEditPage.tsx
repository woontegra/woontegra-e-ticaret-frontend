import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/shared/api/client';
import {
  getMailTemplate,
  MAIL_TEMPLATE_KEY_LABELS,
  updateMailTemplate,
} from '@/shared/api/mail.api';
import { MailSettingsSubNav } from '@/admin/components/MailSettingsSubNav';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Input,
  Label,
  Textarea,
} from '@/shared/ui';

export function MailTemplateEditPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [textContent, setTextContent] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const templateQuery = useQuery({
    queryKey: ['admin', 'mail-templates', id],
    queryFn: () => getMailTemplate(id!),
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (templateQuery.data) {
      const template = templateQuery.data;
      setName(template.name);
      setSubject(template.subject);
      setHtmlContent(template.htmlContent);
      setTextContent(template.textContent ?? '');
      setIsActive(template.isActive);
    }
  }, [templateQuery.data]);

  const saveMutation = useMutation({
    mutationFn: () =>
      updateMailTemplate(id!, {
        name,
        subject,
        htmlContent,
        textContent: textContent.trim() || null,
        isActive,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'mail-templates'] });
      setErrorMessage(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
    onError: (error) => {
      setErrorMessage(
        error instanceof ApiError ? error.message : 'Kayıt başarısız',
      );
    },
  });

  if (templateQuery.isLoading) {
    return <p className="text-sm text-slate-500">Yükleniyor…</p>;
  }

  if (!templateQuery.data) {
    return (
      <p className="text-sm text-red-600">
        Şablon bulunamadı.{' '}
        <Link to="/admin/settings/mail/templates" className="underline">
          Listeye dön
        </Link>
      </p>
    );
  }

  const template = templateQuery.data;

  return (
    <>
      <MailSettingsSubNav />
      <div className="mb-3">
        <Link
          to="/admin/settings/mail/templates"
          className="text-sm text-slate-500 hover:underline"
        >
          ← Şablon listesi
        </Link>
      </div>

      <Card padding="sm">
        <CardHeader
          title={template.name}
          description={`Anahtar: ${MAIL_TEMPLATE_KEY_LABELS[template.key] ?? template.key}`}
          action={
            <Badge variant={isActive ? 'success' : 'default'}>
              {isActive ? 'Aktif' : 'Pasif'}
            </Badge>
          }
        />

        <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-sm font-medium text-slate-800">
            Kullanılabilir değişkenler
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {template.variables.map((variable) => (
              <li
                key={variable.name}
                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs"
                title={variable.description}
              >
                <code>{'{{' + variable.name + '}}'}</code>
                {variable.description ? (
                  <span className="ml-1 text-slate-500">
                    — {variable.description}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-4">
          <div>
            <Label>Görünen ad</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>E-posta konusu</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div>
            <Label>HTML içerik</Label>
            <Textarea
              rows={12}
              className="font-mono text-sm"
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
            />
          </div>
          <div>
            <Label>Düz metin (opsiyonel)</Label>
            <Textarea
              rows={6}
              className="font-mono text-sm"
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Şablon aktif
          </label>
        </div>

        {errorMessage ? (
          <p className="mt-3 text-sm text-red-600">{errorMessage}</p>
        ) : null}
        {saved ? (
          <p className="mt-3 text-sm text-green-600">Kaydedildi.</p>
        ) : null}

        <div className="mt-4 flex justify-end gap-2">
          <Link
            to="/admin/settings/mail/templates"
            className="inline-flex items-center rounded-md border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            İptal
          </Link>
          <Button
            disabled={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            Kaydet
          </Button>
        </div>
      </Card>
    </>
  );
}
