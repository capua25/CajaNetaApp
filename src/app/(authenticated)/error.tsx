'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { AlertTriangle, RotateCw, Home } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'

export default function AuthenticatedError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[authenticated-error]', error.digest ?? error.message)
  }, [error])

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center text-center py-16 space-y-6">
        <AlertTriangle className="h-12 w-12 text-destructive" aria-hidden="true" />
        <div className="space-y-2 max-w-md">
          <h1 className="text-2xl font-bold text-foreground">Algo se rompió</h1>
          <p className="text-muted-foreground text-sm">
            Tuvimos un problema cargando esta sección. Probá reintentar o volvé al panel.
          </p>
          {error.digest ? (
            <p className="text-xs text-muted-foreground font-mono">ref: {error.digest}</p>
          ) : null}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={reset} className="gap-2">
            <RotateCw className="h-4 w-4" aria-hidden="true" />
            Reintentar
          </Button>
          <Link href="/dashboard" className={buttonVariants({ variant: 'outline', className: 'gap-2' })}>
            <Home className="h-4 w-4" aria-hidden="true" />
            Volver al panel
          </Link>
        </div>
      </div>
    </main>
  )
}
