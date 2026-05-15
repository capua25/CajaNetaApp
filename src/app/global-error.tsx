'use client'

import { Inter } from 'next/font/google'
import { AlertTriangle, RotateCw } from 'lucide-react'
import { useEffect } from 'react'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[global-error]', error.digest ?? error.message)
  }, [error])

  return (
    <html lang="es">
      <body className={inter.className}>
        <main className="min-h-screen flex items-center justify-center px-4 py-8 bg-background text-foreground">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="flex justify-center">
              <AlertTriangle className="h-12 w-12 text-destructive" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">Algo se rompió</h1>
              <p className="text-gray-500 text-sm">
                Tuvimos un problema inesperado. Probá recargar la página; si persiste, escribinos.
              </p>
              {error.digest ? (
                <p className="text-xs text-gray-400 font-mono">ref: {error.digest}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-colors"
            >
              <RotateCw className="h-4 w-4" aria-hidden="true" />
              Reintentar
            </button>
          </div>
        </main>
      </body>
    </html>
  )
}
