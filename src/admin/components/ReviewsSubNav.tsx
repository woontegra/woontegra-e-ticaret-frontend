import type { ProductReviewStatus } from '@/shared/types/api';

const tabs: { label: string; status: ProductReviewStatus | '' }[] = [
  { label: 'Onay bekleyenler', status: 'PENDING' },
  { label: 'Yayındakiler', status: 'APPROVED' },
  { label: 'Reddedilenler', status: 'REJECTED' },
];

interface ReviewsSubNavProps {
  activeStatus: ProductReviewStatus | '';
  onChange: (status: ProductReviewStatus | '') => void;
}

export function ReviewsSubNav({ activeStatus, onChange }: ReviewsSubNavProps) {
  return (
    <nav className="mb-4 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
      {tabs.map((tab) => (
        <button
          key={tab.status || 'all'}
          type="button"
          onClick={() => onChange(tab.status)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            activeStatus === tab.status
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
