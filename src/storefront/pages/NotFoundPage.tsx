import { Link } from 'react-router-dom';
import { uiLabel } from '@/shared/lib/storefront-ui';
import { useOptionalPublicPage } from '@/storefront/hooks/useOptionalPublicPage';
import { useStorefrontUi } from '@/storefront/hooks/useStorefrontUi';

export function NotFoundPage() {
  const cmsQuery = useOptionalPublicPage('404');
  const ui = useStorefrontUi();
  const fallbackMessage = uiLabel(ui, 'notFoundMessage');
  const homeLink = uiLabel(ui, 'notFoundHomeLink');

  return (
    <div className="mx-auto max-w-lg py-12 text-center">
      {cmsQuery.data?.title ? (
        <h1 className="theme-heading text-2xl">{cmsQuery.data.title}</h1>
      ) : null}
      {cmsQuery.data?.contentHtml ? (
        <div
          className="prose prose-slate mx-auto mt-4 text-left text-sm"
          dangerouslySetInnerHTML={{ __html: cmsQuery.data.contentHtml }}
        />
      ) : fallbackMessage ? (
        <p className="mt-4 text-sm text-theme-muted">{fallbackMessage}</p>
      ) : null}
      {homeLink ? (
        <p className="mt-6">
          <Link to="/" className="theme-link text-sm">
            {homeLink}
          </Link>
        </p>
      ) : null}
    </div>
  );
}
