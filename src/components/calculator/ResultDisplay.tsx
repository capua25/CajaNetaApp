import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import type { Product, CalculationResult } from '@/lib/types'

interface ResultDisplayProps {
  product: Product
  result: CalculationResult
}

const formatUYU = (value: number) =>
  new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU', maximumFractionDigits: 0 }).format(value)

function getStatusMessage(result: CalculationResult, desiredMargin: number): string {
  if (result.margin < 0) return 'Estás vendiendo por debajo del costo.'
  if (result.monthly_profit === 0) return 'Sin ventas registradas. El margen no refleja impacto real.'
  if (result.status === 'success') return 'Estás cumpliendo tu objetivo de margen.'
  if (result.status === 'warning') return 'Rentable, pero por debajo de tu objetivo de margen.'
  return 'Margen muy alejado de tu objetivo.'
}

export function ResultDisplay({ product, result }: ResultDisplayProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={result.status} />
            <span className="text-sm text-gray-500">{getStatusMessage(result, product.desired_margin)}</span>
          </div>
        </div>
      </div>

      {/* Main metrics */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500 mb-1">Ganancia</p>
            <p className={`text-2xl font-bold ${result.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatUYU(result.profit)}
            </p>
            <p className="text-xs text-gray-400 mt-1">por unidad</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500 mb-1">Margen</p>
            <p className={`text-2xl font-bold ${result.margin >= 0.1 ? 'text-gray-900' : 'text-red-600'}`}>
              {(result.margin * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-gray-400 mt-1">sobre el precio</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500 mb-1">Precio sugerido</p>
            <p className="text-2xl font-bold text-blue-600">{formatUYU(result.suggested_price)}</p>
            <p className="text-xs text-gray-400 mt-1">para {(product.desired_margin * 100).toFixed(0)}% margen</p>
          </CardContent>
        </Card>
      </div>

      {/* Detail breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Desglose</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Costo del producto</span>
            <span>{formatUYU(product.cost)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Gastos adicionales</span>
            <span>{formatUYU(product.expenses)}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold border-t pt-2">
            <span>Costo total</span>
            <span>{formatUYU(result.cost_total)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Precio de venta</span>
            <span>{formatUYU(product.price)}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold border-t pt-2">
            <span>Ganancia neta</span>
            <span className={result.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
              {formatUYU(result.profit)}
            </span>
          </div>
          {result.monthly_profit > 0 && (
            <div className="flex justify-between text-sm font-semibold border-t pt-2">
              <span>Aporte mensual</span>
              <span className={`font-semibold ${result.monthly_profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatUYU(result.monthly_profit)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Link href="/dashboard" className="flex-1">
          <Button variant="outline" className="w-full">← Volver al dashboard</Button>
        </Link>
        <Link href={`/product/${product.id}/edit`} className="flex-1">
          <Button className="w-full">Editar producto</Button>
        </Link>
      </div>
    </div>
  )
}
