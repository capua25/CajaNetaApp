'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { aceptarTerminos } from './actions'

export function AcceptTermsForm() {
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await aceptarTerminos()
      // Si el action llegó acá, hubo un error (el camino feliz hace redirect interno)
      setError(result.error)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Checkboxes de aceptación legal */}
      <div className="space-y-3 pt-1">
        <div className="flex items-start gap-3">
          <input
            id="accept-terms"
            type="checkbox"
            checked={acceptedTerms}
            onChange={e => setAcceptedTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 accent-primary cursor-pointer"
          />
          <label htmlFor="accept-terms" className="text-sm text-muted-foreground leading-snug cursor-pointer">
            Acepto los{' '}
            <Link
              href="/legal/terminos"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-foreground hover:text-foreground/80"
            >
              Términos y Condiciones
            </Link>
            {' '}y el{' '}
            <Link
              href="/legal/aviso-legal"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-foreground hover:text-foreground/80"
            >
              Aviso Legal
            </Link>
          </label>
        </div>

        <div className="flex items-start gap-3">
          <input
            id="accept-privacy"
            type="checkbox"
            checked={acceptedPrivacy}
            onChange={e => setAcceptedPrivacy(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 accent-primary cursor-pointer"
          />
          <label htmlFor="accept-privacy" className="text-sm text-muted-foreground leading-snug cursor-pointer">
            He leído y acepto la{' '}
            <Link
              href="/legal/privacidad"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-foreground hover:text-foreground/80"
            >
              Política de Privacidad
            </Link>
          </label>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button
        type="submit"
        className="w-full"
        disabled={isPending || !acceptedTerms || !acceptedPrivacy}
      >
        {isPending ? 'Procesando...' : 'Aceptar y continuar'}
      </Button>
    </form>
  )
}
