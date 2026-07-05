import type { PublicPageBlockDto } from '@/shared/types/api';
import { BlogGridBlock } from './components/BlogGridBlock';
import { BrandLogosBlock } from './components/BrandLogosBlock';
import { CategoryGridBlock } from './components/CategoryGridBlock';
import { ContactFormBlock } from './components/ContactFormBlock';
import { CampaignBlock } from './components/CampaignBlock';
import { FaqBlock } from './components/FaqBlock';
import { HeroBlock } from './components/HeroBlock';
import { HeroSliderBlock } from './components/HeroSliderBlock';
import { ImageBannerBlock } from './components/ImageBannerBlock';
import { NewsletterBlock } from './components/NewsletterBlock';
import { ProductCarouselBlock } from './components/ProductCarouselBlock';
import { ProductGridBlock } from './components/ProductGridBlock';
import { SpacerBlock } from './components/SpacerBlock';
import { TestimonialsBlock } from './components/TestimonialsBlock';
import { TextBlock } from './components/TextBlock';
import { TextImageBlock } from './components/TextImageBlock';
import { TrustBadgesBlock } from './components/TrustBadgesBlock';

export function BlockRenderer({ block }: { block: PublicPageBlockDto }) {
  switch (block.type) {
    case 'HERO':
      return <HeroBlock block={block} />;
    case 'HERO_SLIDER':
      return <HeroSliderBlock block={block} />;
    case 'TEXT':
      return <TextBlock block={block} />;
    case 'TEXT_IMAGE':
      return <TextImageBlock block={block} />;
    case 'IMAGE_BANNER':
      return <ImageBannerBlock block={block} />;
    case 'PRODUCT_GRID':
      return <ProductGridBlock block={block} />;
    case 'PRODUCT_CAROUSEL':
      return <ProductCarouselBlock block={block} />;
    case 'CATEGORY_GRID':
      return <CategoryGridBlock block={block} />;
    case 'BLOG_GRID':
      return <BlogGridBlock block={block} />;
    case 'TRUST_BADGES':
      return <TrustBadgesBlock block={block} />;
    case 'FAQ':
      return <FaqBlock block={block} />;
    case 'CONTACT_FORM':
      return <ContactFormBlock block={block} />;
    case 'CAMPAIGN':
      return <CampaignBlock block={block} />;
    case 'BRAND_LOGOS':
      return <BrandLogosBlock block={block} />;
    case 'TESTIMONIALS':
      return <TestimonialsBlock block={block} />;
    case 'NEWSLETTER':
      return <NewsletterBlock block={block} />;
    case 'CUSTOM_SPACER':
      return <SpacerBlock block={block} />;
    default:
      return null;
  }
}
