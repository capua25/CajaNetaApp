export default function FinanzasLoading() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-8" aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando finanzas…</span>

      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-56 bg-muted rounded animate-pulse" />
          <div className="h-4 w-56 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-9 w-32 bg-muted rounded-md animate-pulse" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border border-border rounded-lg bg-card p-6 space-y-3">
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            <div className="h-8 w-24 bg-muted rounded animate-pulse" />
            <div className="h-3 w-40 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>

      <div className="border border-border rounded-lg bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-40 bg-muted rounded animate-pulse" />
          <div className="h-9 w-36 bg-muted rounded-md animate-pulse" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 w-full bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>

      <div className="border border-border rounded-lg bg-card p-6 space-y-4">
        <div className="h-6 w-48 bg-muted rounded animate-pulse" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-full bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    </main>
  )
}
