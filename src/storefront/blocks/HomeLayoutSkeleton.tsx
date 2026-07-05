export function HomeLayoutSkeleton() {
  return (
    <div
      className="animate-pulse space-y-10 px-4 py-10 sm:px-6"
      aria-busy="true"
      aria-label="Ana sayfa yükleniyor"
    >
      <div className="mx-auto max-w-5xl space-y-3">
        <div className="h-7 w-2/5 max-w-xs rounded bg-slate-200" />
        <div className="h-4 w-full max-w-xl rounded bg-slate-100" />
        <div className="h-4 w-4/5 max-w-lg rounded bg-slate-100" />
      </div>
      <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2">
        <div className="h-56 rounded-lg bg-slate-100 md:h-72" />
        <div className="hidden h-56 rounded-lg bg-slate-100 md:block md:h-72" />
      </div>
      <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <div className="aspect-square rounded-lg bg-slate-100" />
            <div className="h-3 w-2/3 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
