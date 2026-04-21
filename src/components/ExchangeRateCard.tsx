'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ExchangeRateCardProps {
  initialRate: number
  initialSource: 'api' | 'manual' | 'stale'
  initialEffectiveDate: string
  initialStale: boolean
  hasOverride: boolean
}

const SOURCE_BADGE: Record<
  'api' | 'manual' | 'stale',
  { label: string; variant: 'secondary' | 'default' | 'outline' }
> = {
  api:    { label: 'Automático',    variant: 'secondary' },
  manual: { label: 'Manual',        variant: 'default'   },
  stale:  { label: 'Desactualizado', variant: 'outline'  },
}

export function ExchangeRateCard({
  initialRate,
  initialSource,
  initialEffectiveDate,
  initialStale,
  hasOverride: initialHasOverride,
}: ExchangeRateCardProps) {
  const router = useRouter()

  const [rate, setRate]           = useState(initialRate)
  const [source, setSource]       = useState(initialSource)
  const [effectiveDate]           = useState(initialEffectiveDate)
  const [hasOverride, setHasOverride] = useState(initialHasOverride)

  const [showForm, setShowForm]   = useState(false)
  const [inputVal, setInputVal]   = useState('')
  const [inputError, setInputError] = useState<string | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const [isPending, startTransition] = useTransition()

  function handleSave() {
    const parsed = parseFloat(inputVal)
    if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 1000) {
      setInputError('Ingresá un valor entre 0.01 y 1000.')
      return
    }
    setInputError(null)
    setFetchError(null)

    startTransition(async () => {
      try {
        const res = await fetch('/api/exchange-rate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rate: parsed }),
        })
        if (!res.ok) {
          setFetchError('No se pudo guardar la tasa. Intentá de nuevo.')
          return
        }
        setRate(parsed)
        setSource('manual')
        setHasOverride(true)
        setShowForm(false)
        setInputVal('')
        router.refresh()
      } catch {
        setFetchError('No se pudo guardar la tasa. Intentá de nuevo.')
      }
    })
  }

  function handleUseAuto() {
    setFetchError(null)

    startTransition(async () => {
      try {
        const delRes = await fetch('/api/exchange-rate', { method: 'DELETE' })
        if (!delRes.ok) {
          setFetchError('No se pudo restablecer la tasa automática. Intentá de nuevo.')
          return
        }
        const getRes = await fetch('/api/exchange-rate')
        if (getRes.ok) {
          const data = await getRes.json() as { rate: number; source: 'api' | 'manual' | 'stale' }
          setRate(data.rate)
          setSource(data.source)
        }
        setHasOverride(false)
        router.refresh()
      } catch {
        setFetchError('No se pudo restablecer la tasa automática. Intentá de nuevo.')
      }
    })
  }

  const formattedDate = new Date(effectiveDate).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const badgeConfig = SOURCE_BADGE[source]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Tasa de cambio</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Tasa actual</span>
          <span className="font-medium">1 USD = {rate.toFixed(3)} UYU</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Fuente</span>
          <Badge variant={badgeConfig.variant}>{badgeConfig.label}</Badge>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Vigente desde</span>
          <span className="text-gray-700">{formattedDate}</span>
        </div>

        {fetchError && (
          <p className="text-sm text-red-500">{fetchError}</p>
        )}

        {!showForm ? (
          <div className="pt-1 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setShowForm(true); setFetchError(null) }}
              disabled={isPending}
            >
              Establecer manual
            </Button>
            {hasOverride && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUseAuto}
                disabled={isPending}
              >
                {isPending ? 'Restableciendo...' : 'Usar automático'}
              </Button>
            )}
          </div>
        ) : (
          <div className="pt-1 space-y-2">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0.01}
                max={1000}
                step={0.01}
                placeholder="Ej: 42.50"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                disabled={isPending}
                className="max-w-[140px]"
                aria-invalid={inputError != null ? true : undefined}
              />
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isPending}
              >
                {isPending ? 'Guardando...' : 'Guardar'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setShowForm(false); setInputVal(''); setInputError(null) }}
                disabled={isPending}
              >
                Cancelar
              </Button>
            </div>
            {inputError && (
              <p className="text-sm text-red-500">{inputError}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
