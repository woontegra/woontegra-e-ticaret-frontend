import { Link } from 'react-router-dom';
import type { CompanySettingDto } from '@woontegra/shared';
import { SeoHead } from '@/storefront/components/SeoHead';
import { usePublicCompanySettings, usePublicSiteSettings } from '@/storefront/hooks/usePublicSettings';

export function ContactPage() {
  const siteQuery = usePublicSiteSettings();
  const companyQuery = usePublicCompanySettings();
  const company = companyQuery.data;

  return (
    <>
      <SeoHead
        siteSettings={siteQuery.data}
        title={
          siteQuery.data?.siteName
            ? `İletişim | ${siteQuery.data.siteName}`
            : undefined
        }
      />
      <ContactContent company={company} />
    </>
  );
}

function ContactContent({ company }: { company?: CompanySettingDto }) {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold text-slate-900">İletişim</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <ContactItem label="Firma" value={company?.companyName} />
        <ContactItem label="Telefon" value={company?.phone} href={`tel:${company?.phone}`} />
        <ContactItem
          label="WhatsApp"
          value={company?.whatsapp}
          href={company?.whatsapp ? `https://wa.me/${company.whatsapp.replace(/\D/g, '')}` : undefined}
        />
        <ContactItem
          label="E-posta"
          value={company?.email}
          href={company?.email ? `mailto:${company.email}` : undefined}
        />
        <ContactItem
          label="Destek"
          value={company?.supportEmail}
          href={company?.supportEmail ? `mailto:${company.supportEmail}` : undefined}
        />
        <ContactItem label="Çalışma saatleri" value={company?.workingHours} />
      </div>

      {(company?.address || company?.city || company?.district) && (
        <div className="mt-6 rounded-lg border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-900">Adres</h2>
          {company?.address ? (
            <p className="mt-2 text-sm text-slate-600">{company.address}</p>
          ) : null}
          {(company?.district || company?.city) && (
            <p className="mt-1 text-sm text-slate-600">
              {[company?.district, company?.city].filter(Boolean).join(' / ')}
            </p>
          )}
        </div>
      )}

      <p className="mt-6 text-sm">
        <Link to="/" className="text-slate-600 hover:text-slate-900">
          ← Ana sayfaya dön
        </Link>
      </p>
    </div>
  );
}

function ContactItem({
  label,
  value,
  href,
}: {
  label: string;
  value?: string;
  href?: string;
}) {
  if (!value) return null;

  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      {href ? (
        <a href={href} className="mt-1 block text-sm text-slate-800 hover:underline">
          {value}
        </a>
      ) : (
        <p className="mt-1 text-sm text-slate-800">{value}</p>
      )}
    </div>
  );
}
