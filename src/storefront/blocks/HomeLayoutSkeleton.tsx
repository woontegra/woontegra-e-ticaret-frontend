export function HomeLayoutSkeleton() {
  return (
    <div
      className="animate-pulse space-y-8 px-4 py-10 sm:px-6"
      aria-busy="true"
      aria-label="Sayfa yükleniyor"
    >
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="h-48 rounded-lg bg-slate-100 sm:h-56" />
        <div className="h-32 rounded-lg bg-slate-100" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-40 rounded-lg bg-slate-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
