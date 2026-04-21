'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CurrencySelector } from '@/components/CurrencySelector'
import type { Currency } from '@/lib/types'

interface DisplayCurrencySectionProps {
  initialCurrency: Currency
}

const CURRENCY_LABELS: Record<Currency, string> = {
  UYU: 'Peso uruguayo (UYU)',
  USD: 'Dólar estadounidense (USD)',
}

export function DisplayCurrencySection({ initialCurrency }: DisplayCurrencySectionProps) {
  const router = useRouter()
  const [currency, setCurrency] = useState<Currency>(initialCurrency)
  const [pendingCurrency, setPendingCurrency] = useState<Currency | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleChange(next: Currency) {
    if (next === currency) return
    setPendingCurrency(next)
  }

  function handleConfirm() {
    if (!pendingCurrency) return
    const next = pendingCurrency
    const previous = currency
    setPendingCurrency(null)
    setCurrency(next)
    setError(null)

    startTransition(async () => {
      try {
        const res = await fetch('/api/user/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ display_currency: next }),
        })
        if (!res.ok) {
          setCurrency(previous)
          setError('No se pudo guardar la moneda. Intentá de nuevo.')
          return
        }
        router.refresh()
      } catch {
        setCurrency(previous)
        setError('No se pudo guardar la moneda. Intentá de nuevo.')
      }
    })
  }

  function handleCancel() {
    setPendingCurrency(null)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Moneda de visualización</CardTitle>
          <CardDescription>
            Elegí en qué moneda ver tus totales y gráficos. Los montos se convierten usando el tipo de cambio activo; los valores originales de cada producto se preservan.
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

      <Dialog open={pendingCurrency !== null} onOpenChange={(open) => { if (!open) handleCancel() }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>¿Cambiar moneda de visualización?</DialogTitle>
            <DialogDescription>
              Todos los montos del dashboard se mostrarán en{' '}
              <strong>{pendingCurrency ? CURRENCY_LABELS[pendingCurrency] : ''}</strong>,
              convertidos con el tipo de cambio activo.
              Los valores originales de tus productos no se modifican.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>Cancelar</Button>
            <Button onClick={handleConfirm} disabled={isPending}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
