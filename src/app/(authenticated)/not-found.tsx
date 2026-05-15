import Link from 'next/link'
import { FileQuestion, Home } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'

export default function AuthenticatedNotFound() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center text-center py-16 space-y-6">
        <FileQuestion className="h-12 w-12 text-gray-400" aria-hidden="true" />
        <div className="space-y-2 max-w-md">
          <h1 className="text-2xl font-bold text-gray-900">No encontramos lo que buscás</h1>
          <p className="text-gray-500 text-sm">
            El producto o la página puede haberse eliminado, o no tenés acceso.
          </p>
        </div>
        <Link href="/dashboard" className={buttonVariants({ className: 'gap-2' })}>
          <Home className="h-4 w-4" aria-hidden="true" />
          Volver al panel
        </Link>
      </div>
    </main>
  )
}
