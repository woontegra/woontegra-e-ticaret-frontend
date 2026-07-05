import { AdminSubNav } from '@/admin/components/AdminSubNav';

const links = [
  { label: 'SMTP & gönderim', path: '/admin/settings/mail', end: true },
  { label: 'Şablonlar', path: '/admin/settings/mail/templates' },
];

export function MailSettingsSubNav() {
  return <AdminSubNav links={links} ariaLabel="Mail sekmeleri" />;
}
