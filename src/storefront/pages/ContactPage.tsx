import { Link, useLocation } from 'react-router-dom';
import type {
  CompanySettingDto,
  PageDto,
  SeoSettingPublicDto,
  SiteSettingDto,
} from '@/shared/types/api';
import { SeoHead } from '@/storefront/components/SeoHead';
import { StorefrontPageHeading } from '@/storefront/components/StorefrontPageHeading';
import { ContactForm } from '@/storefront/components/ContactForm';
import { useOptionalPublicPage } from '@/storefront/hooks/useOptionalPublicPage';
import { usePageSeo } from '@/storefront/hooks/usePageSeo';
import {
  buildCanonicalUrl,
  resolveSeoDescription,
  resolveSeoTitle,
} from '@/shared/lib/seo-meta';
import {
  usePublicCompanySettings,
  usePublicSiteSettings,
} from '@/storefront/hooks/usePublicSettings';

export function ContactPage() {
  const location = useLocation();
  const siteQuery = usePublicSiteSettings();
  const companyQuery = usePublicCompanySettings();
  const { seoSettings } = usePageSeo();
  const cmsQuery = useOptionalPublicPage('iletisim');
  const cmsPage = cmsQuery.data;

  return (
    <>
      <SeoHead
        siteSettings={siteQuery.data}
        seoSettings={seoSettings}
        title={resolveSeoTitle(
          cmsPage
            ? {
                seoTitle: cmsPage.seoTitle,
                seoDescription: cmsPage.seoDescription,
              }
            : undefined,
          seoSettings,
          siteQuery.data,
        )}
        description={resolveSeoDescription(
          cmsPage ? { seoDescription: cmsPage.seoDescription } : undefined,
          seoSettings,
          siteQuery.data,
        )}
        canonicalUrl={buildCanonicalUrl(
          cmsPage?.canonicalUrl,
          location.pathname,
          seoSettings,
          siteQuery.data,
        )}
        robotsIndex={cmsPage?.robotsIndex ?? true}
      />
      <ContactContent
        company={companyQuery.data}
        cmsPage={cmsPage}
        seoSettings={seoSettings}
        siteSettings={siteQuery.data}
      />
    </>
  );
}

function ContactContent({
  company,
  cmsPage,
  seoSettings,
  siteSettings,
}: {
  company?: CompanySettingDto;
  cmsPage?: PageDto | null;
  seoSettings?: SeoSettingPublicDto;
  siteSettings?: SiteSettingDto;
}) {
  return (
    <div className="mx-auto max-w-4xl">
      <StorefrontPageHeading
        cmsPage={cmsPage}
        seoSettings={seoSettings}
        siteSettings={siteSettings}
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="theme-card p-4">
          <ContactForm
            formKey="CONTACT_FORM"
            source="contact_page"
            description={cmsPage?.excerpt ?? undefined}
          />
        </div>

        <aside className="space-y-4">
          {(company?.companyName ||
            company?.phone ||
            company?.email ||
            company?.supportEmail ||
            company?.workingHours) && (
            <div className="theme-card p-4">
              <dl className="space-y-2 text-sm">
                <ContactItem label="Firma" value={company?.companyName} />
                <ContactItem
                  label="Telefon"
                  value={company?.phone}
                  href={company?.phone ? `tel:${company.phone}` : undefined}
                />
                <ContactItem
                  label="E-posta"
                  value={company?.email}
                  href={company?.email ? `mailto:${company.email}` : undefined}
                />
                <ContactItem
                  label="Destek"
                  value={company?.supportEmail}
                  href={
                    company?.supportEmail
                      ? `mailto:${company.supportEmail}`
                      : undefined
                  }
                />
                <ContactItem
                  label="Çalışma saatleri"
                  value={company?.workingHours}
                />
              </dl>
            </div>
          )}

          {(company?.address || company?.city || company?.district) && (
            <div className="theme-card p-4">
              {company?.address ? (
                <p className="text-sm text-theme-muted">{company.address}</p>
              ) : null}
              {(company?.district || company?.city) && (
                <p className="mt-1 text-sm text-theme-muted">
                  {[company?.district, company?.city].filter(Boolean).join(' / ')}
                </p>
              )}
            </div>
          )}
        </aside>
      </div>

      <p className="mt-6 text-sm">
        <Link to="/" className="theme-link">
          ← Ana sayfa
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
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-theme-muted">
        {label}
      </dt>
      <dd className="mt-0.5">
        {href ? (
          <a href={href} className="theme-link">
            {value}
          </a>
        ) : (
          <span>{value}</span>
        )}
      </dd>
    </div>
  );
}
