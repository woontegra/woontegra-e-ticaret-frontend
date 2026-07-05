import { parseBlockContent } from '@/shared/lib/block-model';
import type { PublicPageBlockDto } from '@/shared/types/api';
import { BlockSectionWrapper } from '../BlockSectionWrapper';
import { SectionHeading } from '../SectionHeading';

interface BlockComponentProps {
  block: PublicPageBlockDto;
}

export function TrustBadgesBlock({ block }: BlockComponentProps) {
  const content = parseBlockContent(block.content);
  const badges = content.badges ?? [];

  if (badges.length === 0) {
    return (
      <BlockSectionWrapper block={block}>
        <SectionHeading block={block} />
      </BlockSectionWrapper>
    );
  }

  return (
    <BlockSectionWrapper block={block}>
      <SectionHeading block={block} />
      <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {badges.map((badge, index) => (
          <div
            key={`${badge.label}-${index}`}
            className="theme-card flex items-start gap-3 p-4 text-sm"
          >
            {badge.iconUrl ? (
              <img
                src={badge.iconUrl}
                alt=""
                className="h-10 w-10 shrink-0 object-contain"
              />
            ) : (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-500">
                ✓
              </span>
            )}
            <div>
              <p className="font-medium">{badge.label}</p>
              {badge.description ? (
                <p className="mt-0.5 text-theme-muted">{badge.description}</p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </BlockSectionWrapper>
  );
}
