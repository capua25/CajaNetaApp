'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CurrencySelector } from '@/components/CurrencySelector'
import type { Currency } from '@/lib/types'

interface DisplayCurrencySectionProps {
  initialCurrency: Currency
}

export function DisplayCurrencySection({ initialCurrency }: DisplayCurrencySectionProps) {
  const router = useRouter()
  const [currency, setCurrency] = useState<Currency>(initialCurrency)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleChange(next: Currency) {
    const previous = currency
    setCurrency(next) // actualización optimista
    setError(null)

    startTransition(async () => {
      try {
        const res = await fetch('/api/user/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ display_currency: next }),
        })
        if (!res.ok) {
          setCurrency(previous) // revertir
          setError('No se pudo guardar la moneda. Intentá de nuevo.')
          return
        }
        router.refresh()
      } catch {
        setCurrency(previous) // revertir
        setError('No se pudo guardar la moneda. Intentá de nuevo.')
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Moneda de visualización</CardTitle>
        <CardDescription>
          Elegí en qué moneda ver tus totales y gráficos. Los valores originales de cada producto se preservan.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <CurrencySelector
          id="display-currency"
          value={currency}
          onChange={handleChange}
          disabled={isPending}
        />
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </CardContent>
    </Card>
  )
}
