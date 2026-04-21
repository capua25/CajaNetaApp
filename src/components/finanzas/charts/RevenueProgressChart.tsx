'use client'

import { formatCurrency } from '@/lib/currency'
import type { Currency } from '@/lib/types'

interface RevenueProgressChartProps {
  actual_revenue: number
  break_even_revenue: number | null
  currency: Currency
}

export function RevenueProgressChart({
  actual_revenue,
  break_even_revenue,
  currency,
}: RevenueProgressChartProps) {
  if (break_even_revenue === null || actual_revenue === 0) {
    return (
      <p className="text-sm text-muted-foreground italic py-4">
        Sin datos suficientes para mostrar la comparación.
      </p>
    )
  }

  const isAbove = actual_revenue >= break_even_revenue
  const max = Math.max(actual_revenue, break_even_revenue) * 1.15
  const actualPct = (actual_revenue / max) * 100
  const bePct = (break_even_revenue / max) * 100

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-3">
        <div className="relative h-7 w-full rounded-full bg-muted">
          {/* Actual revenue fill */}
          <div
            className={`absolute inset-y-0 left-0 rounded-full transition-all ${
              isAbove ? 'bg-green-500' : 'bg-red-400'
            }`}
            style={{ width: `${actualPct}%` }}
          />

          {/* Break-even threshold marker */}
          <div
            className="absolute top-[-6px] bottom-[-6px] w-0.5 bg-gray-700 z-10 rounded-full"
            style={{ left: `${bePct}%` }}
          />
        </div>

        {/* Threshold label */}
        <div className="relative text-xs text-muted-foreground">
          <span
            className="absolute -translate-x-1/2"
            style={{ left: `${bePct}%` }}
          >
            Equilibrio: {formatCurrency(break_even_revenue, currency)}
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 pt-4">
        <div className="rounded-lg bg-muted/50 p-3 space-y-1">
          <p className="text-xs text-muted-foreground">Ventas actuales</p>
          <p
            className={`text-xl font-bold tabular-nums ${
              isAbove ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {formatCurrency(actual_revenue, currency)}
          </p>
        </div>
        <div className="rounded-lg bg-muted/50 p-3 space-y-1">
          <p className="text-xs text-muted-foreground">Punto de equilibrio</p>
          <p className="text-xl font-bold tabular-nums">
            {formatCurrency(break_even_revenue, currency)}
          </p>
        </div>
      </div>

      {/* Delta message */}
      <p
        className={`text-sm text-center font-medium ${
          isAbove ? 'text-green-700' : 'text-red-700'
        }`}
      >
        {isAbove
          ? `Superás el equilibrio por ${formatCurrency(actual_revenue - break_even_revenue, currency)}`
          : `Te faltan ${formatCurrency(break_even_revenue - actual_revenue, currency)} para alcanzar el equilibrio`}
      </p>
    </div>
  )
}
