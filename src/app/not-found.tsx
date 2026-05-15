import Link from 'next/link'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <FileQuestion className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Página no encontrada</h1>
          <p className="text-gray-500 text-sm">
            La página que buscás no existe o se movió de lugar.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  )
}
