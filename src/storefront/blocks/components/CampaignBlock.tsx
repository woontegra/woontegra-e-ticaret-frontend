import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { parseBlockContent } from '@/shared/lib/block-model';
import { getPublicCampaign } from '@/shared/api/promotions.api';
import type { PublicPageBlockDto } from '@/shared/types/api';
import { LazyImage } from '@/shared/ui/LazyImage';
import { BlockSectionWrapper } from '../BlockSectionWrapper';

interface BlockComponentProps {
  block: PublicPageBlockDto;
}

export function CampaignBlock({ block }: BlockComponentProps) {
  const content = parseBlockContent(block.content);
  const campaignId =
    typeof content.campaignId === 'string' && content.campaignId.trim()
      ? content.campaignId.trim()
      : null;

  const campaignQuery = useQuery({
    queryKey: ['public', 'campaigns', campaignId],
    queryFn: () => getPublicCampaign(campaignId!),
    enabled: Boolean(campaignId),
  });

  if (!campaignId) {
    return (
      <BlockSectionWrapper block={block}>
        <p className="text-center text-sm text-slate-500">
          Kampanya seçilmedi.
        </p>
      </BlockSectionWrapper>
    );
  }

  if (campaignQuery.isLoading) {
    return (
      <BlockSectionWrapper block={block}>
        <div className="h-48 animate-pulse rounded-lg bg-slate-100" />
      </BlockSectionWrapper>
    );
  }

  if (campaignQuery.isError || !campaignQuery.data) {
    return null;
  }

  const campaign = campaignQuery.data;
  const isHero = campaign.type === 'HERO';

  return (
    <BlockSectionWrapper block={block}>
      <div
        className={`relative overflow-hidden rounded-lg ${
          isHero ? 'min-h-[320px]' : ''
        }`}
      >
        {campaign.bannerImageUrl ? (
          <LazyImage
            src={campaign.bannerImageUrl}
            alt={campaign.title}
            className={`w-full object-cover ${isHero ? 'absolute inset-0 h-full' : 'max-h-80'}`}
          />
        ) : null}
        <div
          className={`relative px-6 py-10 ${
            isHero && campaign.bannerImageUrl
              ? 'bg-black/40 text-white'
              : 'bg-white text-slate-900'
          } ${isHero ? 'flex min-h-[320px] flex-col justify-center' : ''}`}
        >
          <h2 className="text-2xl font-semibold sm:text-3xl">{campaign.title}</h2>
          {campaign.description ? (
            <p className="mt-2 max-w-2xl text-sm sm:text-base">
              {campaign.description}
            </p>
          ) : null}
          {campaign.buttonText && campaign.buttonUrl ? (
            <Link
              to={campaign.buttonUrl}
              className={`mt-4 inline-block rounded-md px-4 py-2 text-sm font-medium ${
                isHero && campaign.bannerImageUrl
                  ? 'bg-white text-slate-900 hover:bg-slate-100'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {campaign.buttonText}
            </Link>
          ) : null}
        </div>
      </div>
    </BlockSectionWrapper>
  );
}
