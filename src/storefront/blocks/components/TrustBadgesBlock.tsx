import {
  Check,
  Download,
  Headphones,
  KeyRound,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { parseBlockContent } from '@/shared/lib/block-model';
import type { TrustBadgeIconType } from '@/shared/lib/block-variants';
import type { PublicPageBlockDto } from '@/shared/types/api';
import { BlockSectionWrapper } from '../BlockSectionWrapper';
import { SectionHeading } from '../SectionHeading';

interface BlockComponentProps {
  block: PublicPageBlockDto;
}

function TrustIcon({ type }: { type?: TrustBadgeIconType }) {
  const className = 'h-5 w-5';
  switch (type) {
    case 'KEY':
      return <KeyRound className={className} />;
    case 'DOWNLOAD':
      return <Download className={className} />;
    case 'HEADPHONES':
      return <Headphones className={className} />;
    case 'ZAP':
      return <Zap className={className} />;
    case 'CHECK':
      return <Check className={className} />;
    case 'SHIELD':
    default:
      return <ShieldCheck className={className} />;
  }
}

export function TrustBadgesBlock({ block }: BlockComponentProps) {
  const content = parseBlockContent(block.content);
  const badges = content.badges ?? [];

  return (
    <BlockSectionWrapper block={block}>
      <SectionHeading block={block} />
      {badges.length === 0 ? null : (
        <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {badges.map((badge, index) => (
            <div
              key={`${badge.label}-${index}`}
              className="theme-card flex items-start gap-3 rounded-xl border border-theme-border p-4 text-sm"
            >
              {badge.iconUrl ? (
                <img
                  src={badge.iconUrl}
                  alt=""
                  className="h-10 w-10 shrink-0 object-contain"
                />
              ) : (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white">
                  <TrustIcon type={badge.iconType} />
                </span>
              )}
              <div>
                <p className="font-medium text-theme-text">{badge.label}</p>
                {badge.description ? (
                  <p className="mt-0.5 text-theme-muted">{badge.description}</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </BlockSectionWrapper>
  );
}
