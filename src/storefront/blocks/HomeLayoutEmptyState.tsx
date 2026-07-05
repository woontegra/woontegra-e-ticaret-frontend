export function HomeLayoutEmptyState() {
  return (
    <section className="flex min-h-[40vh] items-center justify-center px-4 py-16">
      <div className="max-w-md text-center">
        <p className="text-sm text-slate-500">
          Ana sayfa henüz yayınlanmadı.
        </p>
        <p className="mt-2 text-xs text-slate-400">
          Yönetim panelinden Sayfa Builder ile içerik oluşturup yayınlayabilirsiniz.
        </p>
      </div>
    </section>
  );
}
