import { Link, useLocation, useSearchParams } from 'react-router-dom';
import type {
  CompanySettingDto,
  ContactLabels,
  PageDto,
  SeoSettingPublicDto,
  SiteSettingDto,
} from '@/shared/types/api';
import { uiLabel } from '@/shared/lib/storefront-ui';
import { SeoHead } from '@/storefront/components/SeoHead';
import { StorefrontPageHeading } from '@/storefront/components/StorefrontPageHeading';
import { ContactForm } from '@/storefront/components/ContactForm';
import { ContactPageSkeleton } from '@/storefront/components/StorefrontSkeletons';
import { useOptionalPublicPage } from '@/storefront/hooks/useOptionalPublicPage';
import { usePageSeo } from '@/storefront/hooks/usePageSeo';
import { useStorefrontUi } from '@/storefront/hooks/useStorefrontUi';
import {
  buildCanonicalUrl,
  resolveSeoDescription,
  resolveSeoTitle,
} from '@/shared/lib/seo-meta';
import {
  usePublicCompanySettings,
  usePublicSiteSettings,
} from '@/storefront/hooks/usePublicSettings';

function getContactLabel(
  labels: ContactLabels | undefined,
  key: keyof ContactLabels,
): string | undefined {
  const value = labels?.[key];
  return value?.trim() ? value.trim() : undefined;
}

export function ContactPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
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
        cmsLoading={cmsQuery.isLoading && !cmsPage}
        companyLoading={companyQuery.isLoading && !companyQuery.data}
        seoSettings={seoSettings}
        siteSettings={siteQuery.data}
        initialKonu={searchParams.get('konu') ?? undefined}
        initialMesaj={searchParams.get('mesaj') ?? undefined}
      />
    </>
  );
}

function ContactContent({
  company,
  cmsPage,
  cmsLoading,
  companyLoading,
  seoSettings,
  siteSettings,
  initialKonu,
  initialMesaj,
}: {
  company?: CompanySettingDto;
  cmsPage?: PageDto | null;
  cmsLoading?: boolean;
  companyLoading?: boolean;
  seoSettings?: SeoSettingPublicDto;
  siteSettings?: SiteSettingDto;
  initialKonu?: string;
  initialMesaj?: string;
}) {
  const ui = useStorefrontUi();
  const backLink = uiLabel(ui, 'contactBackLink') ?? uiLabel(ui, 'notFoundHomeLink');
  const labels = company?.contactLabels;

  if (cmsLoading || companyLoading) {
    return <ContactPageSkeleton />;
  }

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
            formKey={company?.contactFormKey}
            description={cmsPage?.excerpt ?? undefined}
            initialValues={{
              ...(initialKonu ? { konu: initialKonu } : {}),
              ...(initialMesaj ? { mesaj: initialMesaj } : {}),
            }}
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
                <ContactItem
                  label={getContactLabel(labels, 'company')}
                  value={company?.companyName}
                />
                <ContactItem
                  label={getContactLabel(labels, 'phone')}
                  value={company?.phone}
                  href={company?.phone ? `tel:${company.phone}` : undefined}
                />
                <ContactItem
                  label={getContactLabel(labels, 'email')}
                  value={company?.email}
                  href={company?.email ? `mailto:${company.email}` : undefined}
                />
                <ContactItem
                  label={getContactLabel(labels, 'support')}
                  value={company?.supportEmail}
                  href={
                    company?.supportEmail
                      ? `mailto:${company.supportEmail}`
                      : undefined
                  }
                />
                <ContactItem
                  label={getContactLabel(labels, 'workingHours')}
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

      {backLink ? (
        <p className="mt-6 text-sm">
          <Link to="/" className="theme-link">
            {backLink}
          </Link>
        </p>
      ) : null}
    </div>
  );
}

function ContactItem({
  label,
  value,
  href,
}: {
  label?: string;
  value?: string;
  href?: string;
}) {
  if (!label || !value) return null;

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
