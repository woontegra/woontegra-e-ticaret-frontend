import type { CompanySettingDto, SocialLinks } from '@/shared/types/api';

interface PublicFooterProps {
  companySettings?: CompanySettingDto;
}

const socialLabels: Record<keyof SocialLinks, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  twitter: 'X',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  tiktok: 'TikTok',
};

export function PublicFooter({ companySettings }: PublicFooterProps) {
  const socialEntries = Object.entries(companySettings?.socialLinks ?? {}).filter(
    ([, url]) => Boolean(url),
  ) as Array<[keyof SocialLinks, string]>;

  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div>
            {companySettings?.companyName ? (
              <p className="text-sm font-semibold text-slate-900">
                {companySettings.companyName}
              </p>
            ) : null}
            {companySettings?.tradeName ? (
              <p className="mt-1 text-xs text-slate-500">
                {companySettings.tradeName}
              </p>
            ) : null}
          </div>

          <div className="text-sm text-slate-600">
            {companySettings?.address ? <p>{companySettings.address}</p> : null}
            {(companySettings?.district || companySettings?.city) && (
              <p className="mt-1">
                {[companySettings.district, companySettings.city]
                  .filter(Boolean)
                  .join(' / ')}
              </p>
            )}
            {companySettings?.phone ? (
              <p className="mt-2">
                <a href={`tel:${companySettings.phone}`} className="hover:underline">
                  {companySettings.phone}
                </a>
              </p>
            ) : null}
            {companySettings?.email ? (
              <p className="mt-1">
                <a href={`mailto:${companySettings.email}`} className="hover:underline">
                  {companySettings.email}
                </a>
              </p>
            ) : null}
          </div>

          <div>
            {companySettings?.workingHours ? (
              <p className="text-xs text-slate-500">{companySettings.workingHours}</p>
            ) : null}
            {socialEntries.length > 0 ? (
              <ul className="mt-3 flex flex-wrap gap-2">
                {socialEntries.map(([key, url]) => (
                  <li key={key}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-600 underline-offset-2 hover:underline"
                    >
                      {socialLabels[key]}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  );
}
