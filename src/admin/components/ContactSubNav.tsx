import { AdminSubNav } from '@/admin/components/AdminSubNav';

const links = [
  { label: 'Mesajlar', path: '/admin/contact', end: true },
  { label: 'Formlar', path: '/admin/contact/forms' },
];

export function ContactSubNav() {
  return <AdminSubNav links={links} ariaLabel="İletişim sekmeleri" />;
}
