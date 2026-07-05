interface SkeletonBlockProps {
  className?: string;
}

export function SkeletonBlock({ className = 'h-24 rounded-lg bg-slate-100' }: SkeletonBlockProps) {
  return <div className={`animate-pulse ${className}`} aria-hidden />;
}

export function PageHeadingSkeleton() {
  return (
    <div className="mb-6 animate-pulse space-y-3" aria-hidden>
      <div className="h-8 w-2/5 max-w-sm rounded bg-slate-200" />
      <div className="h-4 w-3/5 max-w-md rounded bg-slate-100" />
    </div>
  );
}

export function ArticleSkeleton() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse space-y-6" aria-busy="true">
      <SkeletonBlock className="aspect-[21/9] w-full rounded-lg bg-slate-100" />
      <SkeletonBlock className="h-8 w-2/3 rounded bg-slate-200" />
      <div className="space-y-3">
        <SkeletonBlock className="h-4 w-full rounded bg-slate-100" />
        <SkeletonBlock className="h-4 w-full rounded bg-slate-100" />
        <SkeletonBlock className="h-4 w-5/6 rounded bg-slate-100" />
        <SkeletonBlock className="h-4 w-4/5 rounded bg-slate-100" />
      </div>
    </div>
  );
}

export function BlogListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <ul
      className="mt-8 grid animate-pulse gap-6 sm:grid-cols-2"
      aria-busy="true"
      aria-label="Blog yazıları yükleniyor"
    >
      {Array.from({ length: count }).map((_, index) => (
        <li key={index} className="overflow-hidden rounded-lg border border-slate-100">
          <SkeletonBlock className="aspect-[16/9] w-full rounded-none bg-slate-100" />
          <div className="space-y-3 p-4">
            <SkeletonBlock className="h-3 w-16 rounded bg-slate-100" />
            <SkeletonBlock className="h-5 w-4/5 rounded bg-slate-200" />
            <SkeletonBlock className="h-3 w-full rounded bg-slate-100" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function ContactPageSkeleton() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse" aria-busy="true">
      <PageHeadingSkeleton />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <SkeletonBlock className="h-96 rounded-lg bg-slate-100" />
        <div className="space-y-4">
          <SkeletonBlock className="h-40 rounded-lg bg-slate-100" />
          <SkeletonBlock className="h-28 rounded-lg bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

export function FormPageSkeleton() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse space-y-6" aria-busy="true">
      <PageHeadingSkeleton />
      <SkeletonBlock className="h-64 rounded-lg bg-slate-100" />
    </div>
  );
}

export function DetailHeroSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true">
      <SkeletonBlock className="aspect-[21/9] w-full max-w-3xl rounded-lg bg-slate-100" />
      <SkeletonBlock className="h-8 w-1/2 max-w-md rounded bg-slate-200" />
      <SkeletonBlock className="h-4 w-2/3 max-w-lg rounded bg-slate-100" />
    </div>
  );
}
