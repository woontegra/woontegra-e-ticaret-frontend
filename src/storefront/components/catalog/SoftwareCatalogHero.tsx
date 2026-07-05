import { Headphones, KeyRound, ShieldCheck, Zap } from 'lucide-react';

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: 'Güvenli lisanslama' },
  { icon: Zap, label: 'Dijital teslimat' },
  { icon: Headphones, label: 'Teknik destek' },
  { icon: KeyRound, label: 'Kurumsal çözüm' },
] as const;

export function SoftwareCatalogHero() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-theme-border bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-sm">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -left-16 top-0 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -right-10 bottom-0 h-56 w-56 rounded-full bg-violet-500/20 blur-3xl" />
      </div>

      <div className="relative px-6 py-10 sm:px-10 sm:py-12 lg:py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
          Woontegra Yazılımları
        </p>
        <h1 className="theme-heading mt-2 max-w-2xl text-2xl text-white sm:text-3xl lg:text-4xl">
          İşletmeler için geliştirilen indirilebilir ve web tabanlı yazılım çözümleri
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
          Masaüstü lisanslı yazılımlardan SaaS aboneliklerine; güvenli ödeme,
          dijital teslimat ve teknik destek ile.
        </p>

        <ul className="mt-6 flex flex-wrap gap-2 sm:gap-3">
          {TRUST_ITEMS.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 ring-1 ring-white/15 backdrop-blur-sm sm:text-sm"
            >
              <Icon className="h-3.5 w-3.5 shrink-0 text-emerald-300" />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
