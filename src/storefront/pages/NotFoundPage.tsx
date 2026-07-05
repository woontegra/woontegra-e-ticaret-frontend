import { Link } from 'react-router-dom';
import { useOptionalPublicPage } from '@/storefront/hooks/useOptionalPublicPage';

export function NotFoundPage() {
  const cmsQuery = useOptionalPublicPage('404');

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
      ) : (
        <p className="mt-4 text-sm text-theme-muted">
          Aradığınız sayfa bulunamadı.
        </p>
      )}
      <p className="mt-6">
        <Link to="/" className="theme-link text-sm">
          ← Ana sayfa
        </Link>
      </p>
    </div>
  );
}
