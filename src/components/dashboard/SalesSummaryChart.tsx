import { Info } from 'lucide-react'
import { Tooltip } from '@/components/ui/tooltip'
import type { Product } from '@/lib/types'

function formatCurrency(v: number) {
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: 'UYU',
    maximumFractionDigits: 0,
  }).format(v)
}

interface SalesSummaryChartProps {
  products: Product[]
}

export function SalesSummaryChart({ products }: SalesSummaryChartProps) {
  const withSales = products.filter((p) => p.quantity_sold > 0)

  const totalUnits = withSales.reduce((acc, p) => acc + p.quantity_sold, 0)
  const totalRevenue = withSales.reduce((acc, p) => acc + p.price * p.quantity_sold, 0)
  const totalProfit = withSales.reduce((acc, p) => acc + (p.price - p.cost - p.expenses) * p.quantity_sold, 0)

  if (withSales.length === 0) {
    return (
      <div className="mb-8 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 py-8 text-center">
        <p className="text-sm text-gray-400">
          Agregá cantidades vendidas a tus productos para ver el resumen de ventas.
        </p>
      </div>
    )
  }

  const sorted = [...withSales].sort((a, b) => b.price * b.quantity_sold - a.price * a.quantity_sold)
  const maxRevenue = sorted[0].price * sorted[0].quantity_sold
  const maxUnits = Math.max(...sorted.map((p) => p.quantity_sold))

  return (
    <div className="mb-8 space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Unidades vendidas</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 tabular-nums">
            {totalUnits.toLocaleString('es-UY')}
            <span className="ml-1 text-sm font-normal text-gray-400">u.</span>
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Monto total</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 tabular-nums">
            {formatCurrency(totalRevenue)}
          </p>
        </div>
        <div className="col-span-2 lg:col-span-1 rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400 flex items-center gap-1">
            Ganancia neta
            <Tooltip content="Suma de la ganancia por unidad de cada producto multiplicada por sus unidades vendidas. No incluye costos fijos.">
              <Info className="h-3 w-3 cursor-help text-gray-300 hover:text-gray-400" />
            </Tooltip>
          </p>
          <p className={`mt-1 text-2xl font-bold tabular-nums ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(totalProfit)}
          </p>
        </div>
      </div>

      {/* Per-product breakdown */}
      <div className="rounded-xl border border-gray-100 bg-white px-5 py-5 shadow-sm">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">Por producto</p>
        <div className="max-h-96 overflow-y-auto pr-1 space-y-4">
          {sorted.map((p) => {
            const revenue = p.price * p.quantity_sold
            const revenuePct = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0
            const unitsPct = maxUnits > 0 ? (p.quantity_sold / maxUnits) * 100 : 0

            return (
              <div key={p.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="max-w-[55%] truncate font-medium text-gray-700">{p.name}</span>
                  <span className="text-right tabular-nums text-xs text-gray-500">
                    {p.quantity_sold.toLocaleString('es-UY')} u.
                    <span className="mx-1.5 text-gray-300">·</span>
                    {formatCurrency(revenue)}
                  </span>
                </div>
                {/* Units bar */}
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-blue-400"
                    style={{ width: `${unitsPct}%` }}
                  />
                </div>
                {/* Revenue bar */}
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-emerald-400"
                    style={{ width: `${revenuePct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-4 border-t border-gray-50 pt-3">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-4 rounded-full bg-blue-400" />
            <span className="text-xs text-gray-400">Unidades</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-4 rounded-full bg-emerald-400" />
            <span className="text-xs text-gray-400">Monto</span>
          </div>
        </div>
      </div>
    </div>
  )
}
