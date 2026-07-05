import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Pencil } from 'lucide-react';
import {
  listMailTemplates,
  MAIL_TEMPLATE_KEY_LABELS,
} from '@/shared/api/mail.api';
import { MailSettingsSubNav } from '@/admin/components/MailSettingsSubNav';
import {
  Badge,
  Card,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/shared/ui';

export function MailTemplatesPage() {
  const templatesQuery = useQuery({
    queryKey: ['admin', 'mail-templates'],
    queryFn: listMailTemplates,
  });

  return (
    <>
      <MailSettingsSubNav />
      <Card padding="sm">
        <CardHeader
          title="Mail şablonları"
          description="Otomatik e-postalar panelden düzenlenir; {{degisken}} sözdizimi kullanılır"
        />

        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Şablon</TableHeaderCell>
              <TableHeaderCell>Anahtar</TableHeaderCell>
              <TableHeaderCell>Konu</TableHeaderCell>
              <TableHeaderCell>Durum</TableHeaderCell>
              <TableHeaderCell className="text-right">İşlem</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {templatesQuery.isLoading ? (
              <TableEmpty colSpan={5} message="Yükleniyor…" />
            ) : (templatesQuery.data?.length ?? 0) === 0 ? (
              <TableEmpty colSpan={5} message="Şablon bulunamadı." />
            ) : (
              templatesQuery.data!.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>{template.name}</TableCell>
                  <TableCell className="font-mono text-xs text-slate-500">
                    {MAIL_TEMPLATE_KEY_LABELS[template.key] ?? template.key}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-slate-600">
                    {template.subject}
                  </TableCell>
                  <TableCell>
                    <Badge variant={template.isActive ? 'success' : 'default'}>
                      {template.isActive ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      to={`/admin/settings/mail/templates/${template.id}`}
                      className="inline-flex rounded-md p-2 text-slate-600 hover:bg-slate-100"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
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
