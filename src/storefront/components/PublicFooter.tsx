import { Link } from 'react-router-dom';
import type { PublicFooterDto, PublicFooterLinkDto } from '@/shared/types/api';
import { NewsletterForm } from '@/storefront/components/NewsletterForm';

interface PublicFooterProps {
  footer?: PublicFooterDto;
}

function formatSocialLabel(key: string): string {
  if (!key) return '';
  return key.charAt(0).toUpperCase() + key.slice(1);
}

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
  );

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

  const showNewsletter =
    footer.showNewsletter &&
    footer.newsletterPlaceholder?.trim() &&
    footer.newsletterButtonLabel?.trim();

  if (
    !hasBrand &&
    !hasColumns &&
    !hasIcons &&
    !showNewsletter &&
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
                        {formatSocialLabel(key)}
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

        {showNewsletter ? (
          <NewsletterForm
            className="theme-card mt-8"
            title={footer.newsletterTitle}
            description={footer.newsletterDescription}
            placeholder={footer.newsletterPlaceholder}
            buttonLabel={footer.newsletterButtonLabel}
            successMessage={footer.newsletterSuccessMessage}
            source="footer"
          />
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
                      alt={icon.altText ?? ''}
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
                      alt={icon.altText ?? ''}
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
