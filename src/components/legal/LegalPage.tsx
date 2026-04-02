import Link from 'next/link'

interface LegalPageProps {
  title: string
  lastUpdated: string
  children: React.ReactNode
}

export function LegalPage({ title, lastUpdated, children }: LegalPageProps) {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link
            href="/auth/register"
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            ← Volver al registro
          </Link>
        </div>
        <article className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 px-8 py-10 space-y-8">
          <header className="border-b pb-6">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="text-sm text-muted-foreground mt-1">Última actualización: {lastUpdated}</p>
          </header>
          <div className="space-y-8 text-sm text-gray-700 leading-relaxed">
            {children}
          </div>
        </article>
      </div>
    </main>
  )
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      {children}
    </section>
  )
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc list-inside space-y-1 text-gray-600 pl-2">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}
