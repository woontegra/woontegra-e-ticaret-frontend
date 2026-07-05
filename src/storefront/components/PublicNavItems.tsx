import { Link } from 'react-router-dom';
import type { PublicMenuItemDto } from '@/shared/types/api';

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

interface PublicNavItemsProps {
  items: PublicMenuItemDto[];
  className?: string;
  nested?: boolean;
  linkClassName?: string;
}

export function PublicNavItems({
  items,
  className = '',
  nested = false,
  linkClassName = 'theme-link',
}: PublicNavItemsProps) {
  if (items.length === 0) return null;

  return (
    <ul className={className}>
      {items.map((item) => (
        <li key={item.id} className={nested ? 'mt-1' : undefined}>
          <PublicNavLink item={item} className={linkClassName} />
          {item.children.length > 0 ? (
            <PublicNavItems
              items={item.children}
              className="ml-3 mt-1 space-y-1 border-l border-theme-border pl-3"
              nested
              linkClassName={linkClassName}
            />
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function PublicNavLink({
  item,
  className,
}: {
  item: PublicMenuItemDto;
  className: string;
}) {
  if (isExternalHref(item.href)) {
    return (
      <a
        href={item.href}
        target={item.openInNewTab ? '_blank' : undefined}
        rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
        className={className}
      >
        {item.label}
      </a>
    );
  }

  if (item.openInNewTab) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {item.label}
      </a>
    );
  }

  return (
    <Link to={item.href} className={className}>
      {item.label}
    </Link>
  );
}
