'use client'

import type { ProductWithMix } from '@/lib/types'

function formatCurrency(v: number) {
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: 'UYU',
    maximumFractionDigits: 0,
  }).format(v)
}

interface BreakEvenChartProps {
  products: ProductWithMix[]
  break_even_units: number | null
  break_even_revenue: number | null
  type: 'units' | 'revenue'
}

export function BreakEvenChart({
  products,
  break_even_units,
  break_even_revenue,
  type,
}: BreakEvenChartProps) {
  const beValue = type === 'units' ? break_even_units : break_even_revenue

  if (beValue === null) {
    return (
      <p className="text-sm text-muted-foreground italic py-4">
        Sin datos suficientes para calcular el punto de equilibrio.
      </p>
    )
  }

  const active = products.filter((p) => p.quantity_sold > 0 && p.mc !== null)

  if (active.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic py-4">
        Ingresá cantidades vendidas para ver el desglose por producto.
      </p>
    )
  }

  const items = active
    .map((p) => ({ name: p.name, value: p.weight * beValue }))
    .sort((a, b) => b.value - a.value)

  const maxValue = items[0].value

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Distribución proporcional según el mix de ventas de cada producto.
      </p>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.name} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium truncate max-w-[55%]">{item.name}</span>
              <span className="text-right tabular-nums">
                <span className="font-medium">
                  {type === 'units'
                    ? `${item.value.toFixed(1)} u.`
                    : formatCurrency(item.value)}
                </span>
                <span className="text-muted-foreground text-xs ml-1.5">
                  ({((item.value / beValue) * 100).toFixed(0)}%)
                </span>
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t flex items-center justify-between text-sm font-semibold">
        <span>Total para equilibrio</span>
        <span>
          {type === 'units'
            ? `${beValue.toFixed(1)} unidades`
            : formatCurrency(beValue)}
        </span>
      </div>
    </div>
  )
}
