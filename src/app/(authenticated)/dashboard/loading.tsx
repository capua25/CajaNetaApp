export default function DashboardLoading() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-8" aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando panel…</span>

      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-56 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-9 w-32 bg-muted rounded-md animate-pulse" />
      </div>

      <div className="mb-8 border border-border rounded-lg bg-card p-6 space-y-4">
        <div className="h-5 w-40 bg-muted rounded animate-pulse" />
        <div className="h-48 w-full bg-muted rounded animate-pulse" />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-muted rounded animate-pulse" />
          <div className="h-9 w-36 bg-muted rounded-md animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border border-border rounded-lg bg-card p-4 space-y-3">
              <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
              <div className="flex gap-2 pt-2">
                <div className="h-8 w-20 bg-muted rounded-md animate-pulse" />
                <div className="h-8 w-20 bg-muted rounded-md animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
