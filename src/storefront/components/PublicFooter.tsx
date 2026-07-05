import { Link } from 'react-router-dom';
import type { PublicFooterDto, PublicFooterLinkDto, SocialLinks } from '@/shared/types/api';

interface PublicFooterProps {
  footer?: PublicFooterDto;
}

const socialLabels: Record<keyof SocialLinks, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  twitter: 'X',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  tiktok: 'TikTok',
};

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

function FooterLink({ link }: { link: PublicFooterLinkDto }) {
  const className = 'theme-link';

  if (isExternalHref(link.href) || link.openInNewTab) {
    return (
      <a
        href={link.href}
        target={link.openInNewTab ? '_blank' : undefined}
        rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
        className={className}
      >
        {link.label}
      </a>
    );
  }

  return (
    <Link to={link.href} className={className}>
      {link.label}
    </Link>
  );
}

export function PublicFooter({ footer }: PublicFooterProps) {
  if (!footer) return null;

  const socialEntries = Object.entries(footer.socialLinks ?? {}).filter(
    ([, url]) => Boolean(url),
  ) as Array<[keyof SocialLinks, string]>;

  const hasBrand =
    footer.logoUrl ||
    footer.description ||
    footer.phone ||
    footer.email ||
    footer.address ||
    socialEntries.length > 0;

  const hasColumns = footer.columns.some((column) => column.links.length > 0);
  const hasIcons =
    footer.paymentIcons.length > 0 || footer.shippingIcons.length > 0;

  if (
    !hasBrand &&
    !hasColumns &&
    !hasIcons &&
    !footer.showNewsletter &&
    !footer.copyrightText
  ) {
    return null;
  }

  return (
    <footer className="theme-footer mt-auto border-t">
      <div className="theme-container mx-auto w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_2fr]">
          {hasBrand ? (
            <div className="space-y-3">
              {footer.logoUrl ? (
                <img
                  src={footer.logoUrl}
                  alt=""
                  className="h-10 max-w-[180px] object-contain"
                />
              ) : null}
              {footer.description ? (
                <p className="text-sm text-theme-muted">{footer.description}</p>
              ) : null}
              {footer.address ? (
                <p className="text-sm text-theme-muted">{footer.address}</p>
              ) : null}
              {footer.phone ? (
                <p className="text-sm">
                  <a href={`tel:${footer.phone}`} className="theme-link">
                    {footer.phone}
                  </a>
                </p>
              ) : null}
              {footer.email ? (
                <p className="text-sm">
                  <a href={`mailto:${footer.email}`} className="theme-link">
                    {footer.email}
                  </a>
                </p>
              ) : null}
              {socialEntries.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
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
          ) : null}

          {hasColumns ? (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {footer.columns.map((column) =>
                column.links.length > 0 ? (
                  <div key={column.id}>
                    <p className="mb-2 text-sm font-semibold theme-heading">
                      {column.title}
                    </p>
                    <ul className="space-y-2 text-sm">
                      {column.links.map((link) => (
                        <li key={link.id}>
                          <FooterLink link={link} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null,
              )}
            </div>
          ) : null}
        </div>

        {footer.showNewsletter ? (
          <div className="theme-card mt-8">
            <form
              className="flex max-w-md flex-col gap-2 sm:flex-row"
              onSubmit={(event) => event.preventDefault()}
            >
              <input
                type="email"
                placeholder="E-posta"
                aria-label="E-posta"
                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <button type="submit" className="theme-btn-primary text-sm">
                Gönder
              </button>
            </form>
          </div>
        ) : null}

        {(hasIcons || footer.copyrightText) && (
          <div className="mt-8 flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-4">
              {footer.paymentIcons.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  {footer.paymentIcons.map((icon) => (
                    <img
                      key={icon.id}
                      src={icon.url}
                      alt={icon.altText ?? 'Ödeme'}
                      className="h-6 object-contain"
                    />
                  ))}
                </div>
              ) : null}
              {footer.shippingIcons.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  {footer.shippingIcons.map((icon) => (
                    <img
                      key={icon.id}
                      src={icon.url}
                      alt={icon.altText ?? 'Kargo'}
                      className="h-6 object-contain"
                    />
                  ))}
                </div>
              ) : null}
            </div>
            {footer.copyrightText ? (
              <p className="text-xs text-theme-muted">{footer.copyrightText}</p>
            ) : null}
          </div>
        )}
      </div>
    </footer>
  );
}
