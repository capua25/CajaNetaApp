'use client'

import type { ProductWithMix, Currency } from '@/lib/types'
import { formatCurrency } from '@/lib/currency'

interface MCMixChartProps {
  products: ProductWithMix[]
  mc_mix: number | null
  currency: Currency
}

export function MCMixChart({ products, mc_mix, currency }: MCMixChartProps) {
  if (mc_mix === null) {
    return (
      <p className="text-sm text-muted-foreground italic py-4">
        Sin datos suficientes para mostrar el análisis.
      </p>
    )
  }

  const active = products
    .filter((p) => p.mc !== null && p.quantity_sold > 0)
    .sort((a, b) => (b.mc as number) - (a.mc as number))

  if (active.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic py-4">
        Ingresá cantidades vendidas para ver el desglose.
      </p>
    )
  }

  const maxMC = active[0].mc as number

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Margen de contribución por unidad (MC) y peso en el mix de ventas.
      </p>

      <div className="space-y-4">
        {active.map((p) => (
          <div key={p.id} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium truncate max-w-[50%]">{p.name}</span>
              <div className="text-right">
                <span className="font-medium tabular-nums">
                  {formatCurrency(p.mc as number, currency)}
                </span>
                {p.rc !== null && (
                  <span className="text-muted-foreground text-xs ml-1.5">
                    RC {(p.rc * 100).toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${((p.mc as number) / maxMC) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {(p.weight * 100).toFixed(0)}% del mix · {p.quantity_sold} u. vendidas
            </p>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t flex items-center justify-between text-sm font-semibold">
        <span>MC Mix ponderado</span>
        <span>{formatCurrency(mc_mix)}</span>
      </div>
    </div>
  )
}
