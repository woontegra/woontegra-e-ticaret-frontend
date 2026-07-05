import { Link } from 'react-router-dom';
import type { DeliveryMode, PublicProductDto } from '@/shared/types/api';
import {
  CreditCard,
  Download,
  Headphones,
  KeyRound,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/shared/lib/cn';

const TRUST_CARDS = [
  {
    icon: ShieldCheck,
    title: 'Güvenli ödeme',
    description: 'Havale/EFT ve online ödeme seçenekleri',
  },
  {
    icon: Download,
    title: 'Dijital teslimat',
    description: 'Ödeme sonrası hızlı erişim',
  },
  {
    icon: KeyRound,
    title: 'Lisans yönetimi',
    description: 'Merkezi lisans ve cihaz takibi',
  },
  {
    icon: Headphones,
    title: 'Teknik destek',
    description: 'Kurulum ve kullanım desteği',
  },
] as const;

const GENERAL_FAQ = [
  {
    question: 'Satın alma sonrası ne olur?',
    answer:
      'Ödemeniz onaylandığında sipariş durumunuz güncellenir; lisans, indirme veya SaaS erişimi otomatik olarak hazırlanır.',
  },
  {
    question: 'Hangi ödeme yöntemlerini kullanabilirim?',
    answer:
      'Havale/EFT ve desteklenen online ödeme yöntemleriyle güvenle ödeme yapabilirsiniz.',
  },
  {
    question: 'Destek alabilir miyim?',
    answer:
      'Kurulum, lisans ve kullanım konularında teknik destek ekibimizle iletişime geçebilirsiniz.',
  },
] as const;

function deliveryInfoLines(mode: DeliveryMode): string[] {
  switch (mode) {
    case 'FREE_DOWNLOAD':
      return [
        'Ücretsiz indirilebilir araç',
        'Kurulum ve portable sürüm seçenekleri',
        'Hesap oluşturmadan indirebilirsiniz',
      ];
    case 'PAID_DOWNLOAD':
      return [
        'Ödeme sonrası güvenli indirme bağlantısı gönderilir',
        'Dijital teslimat',
      ];
    case 'LICENSED_DOWNLOAD':
      return [
        'Ödeme sonrası kurulum dosyası ve lisans bilgileri gönderilir',
        'Lisans süresi ve cihaz limiti ürün detayında belirtilir',
      ];
    case 'SAAS':
      return [
        'Web tabanlı abonelik',
        'Ödeme sonrası hesabınız hazırlanır',
      ];
    case 'QUOTE_ONLY':
      return ['Projenize özel teklif alın', 'İletişim formu üzerinden ulaşın'];
    default:
      return [];
  }
}

export function ProductTrustCards() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {TRUST_CARDS.map(({ icon: Icon, title, description }) => (
        <div
          key={title}
          className="theme-card flex gap-3 rounded-xl border border-theme-border p-4"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-theme-text">{title}</p>
            <p className="mt-0.5 text-xs text-theme-muted">{description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProductDeliveryPanel({
  product,
}: {
  product: PublicProductDto;
}) {
  const lines = deliveryInfoLines(product.deliveryMode);
  if (lines.length === 0) return null;

  return (
    <div className="rounded-xl border border-theme-border bg-theme-surface p-5">
      <h2 className="text-sm font-semibold text-theme-text">Teslimat bilgisi</h2>
      <ul className="mt-3 space-y-2">
        {lines.map((line) => (
          <li key={line} className="flex items-start gap-2 text-sm text-theme-muted">
            <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProductFeaturesSection({
  bullets,
}: {
  bullets: string[];
}) {
  if (bullets.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="theme-heading text-xl sm:text-2xl">Öne çıkan özellikler</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {bullets.map((bullet) => (
          <li
            key={bullet}
            className="flex items-start gap-2 rounded-lg border border-theme-border bg-white p-3 text-sm text-theme-text"
          >
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-900" />
            {bullet}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ProductFaqSection() {
  return (
    <section className="mt-12">
      <h2 className="theme-heading text-xl sm:text-2xl">Sık sorulan sorular</h2>
      <dl className="mt-4 space-y-3">
        {GENERAL_FAQ.map(({ question, answer }) => (
          <div
            key={question}
            className="rounded-xl border border-theme-border bg-white p-4"
          >
            <dt className="text-sm font-semibold text-theme-text">{question}</dt>
            <dd className="mt-1.5 text-sm leading-relaxed text-theme-muted">
              {answer}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function ProductDetailCrossLinks({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        'mt-12 rounded-2xl border border-theme-border bg-gradient-to-br from-slate-50 to-white p-6 sm:p-8',
        className,
      )}
    >
      <h2 className="theme-heading text-lg sm:text-xl">Keşfetmeye devam edin</h2>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          to="/yazilimlar"
          className="theme-btn-primary inline-flex items-center rounded-md px-4 py-2 text-sm"
        >
          Yazılımları inceleyin
        </Link>
        <Link
          to="/blog"
          className="theme-btn-secondary inline-flex items-center rounded-md border border-theme-border px-4 py-2 text-sm"
        >
          Blog yazıları
        </Link>
        <Link
          to="/iletisim"
          className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm text-theme-muted hover:text-theme-text"
        >
          <Mail className="h-4 w-4" />
          İletişime geçin
        </Link>
      </div>
    </section>
  );
}
