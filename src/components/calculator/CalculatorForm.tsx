'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { calculate } from '@/lib/calculator'
import type { Product } from '@/lib/types'

const formatUYU = (value: number) =>
  new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU', maximumFractionDigits: 0 }).format(value)

interface CalculatorFormProps {
  product?: Product
}

export function CalculatorForm({ product }: CalculatorFormProps) {
  const [name, setName] = useState(product?.name ?? '')
  const [cost, setCost] = useState(product ? String(product.cost) : '')
  const [expenses, setExpenses] = useState(product ? String(product.expenses) : '')
  const [price, setPrice] = useState(product ? String(product.price) : '')
  const [desiredMargin, setDesiredMargin] = useState(
    product ? String(Math.round(product.desired_margin * 100)) : '30'
  )
  const [quantitySold, setQuantitySold] = useState(product ? String(product.quantity_sold ?? 0) : '0')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const isEditing = !!product

  const numCost = Number(cost) || 0
  const numExpenses = Number(expenses) || 0
  const numPrice = Number(price) || 0
  const numMargin = (Number(desiredMargin) || 30) / 100

  const preview = useMemo(
    () =>
      numPrice > 0
        ? calculate({
            cost: numCost,
            expenses: numExpenses,
            price: numPrice,
            desired_margin: numMargin,
            quantity_sold: Number(quantitySold) || 0,
          })
        : null,
    [numCost, numExpenses, numPrice, numMargin, quantitySold]
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const url = isEditing ? `/api/products/${product.id}` : '/api/products'
    const method = isEditing ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        cost: numCost,
        expenses: numExpenses,
        price: numPrice,
        desired_margin: numMargin,
        quantity_sold: Number(quantitySold) || 0,
      }),
    })

    if (res.status === 403) {
      setError('Alcanzaste el límite del plan gratuito. Pasate a Pro para continuar.')
      setLoading(false)
      return
    }

    if (!res.ok) {
      setError('Ocurrió un error. Intentá de nuevo.')
      setLoading(false)
      return
    }

    const saved = await res.json()
    router.push(`/product/${saved.id}`)
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Calculá tu producto</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del producto</Label>
              <Input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej: Torta de chocolate"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Costo (UYU)</Label>
              <Input
                id="cost"
                type="number"
                min="0"
                step="1"
                value={cost}
                onChange={e => setCost(e.target.value)}
                placeholder="0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expenses">Gastos adicionales (UYU)</Label>
              <Input
                id="expenses"
                type="number"
                min="0"
                step="1"
                value={expenses}
                onChange={e => setExpenses(e.target.value)}
                placeholder="0"
              />
              <p className="text-xs text-gray-500">Luz, gas, embalaje, delivery...</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Precio de venta (UYU)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="1"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desired_margin">Margen deseado (%)</Label>
              <Input
                id="desired_margin"
                type="number"
                min="1"
                max="99"
                value={desiredMargin}
                onChange={e => setDesiredMargin(e.target.value)}
                placeholder="30"
              />
              <p className="text-xs text-gray-500">Para calcular el precio ideal</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity_sold">Unidades vendidas por mes</Label>
              <Input
                id="quantity_sold"
                type="number"
                min="0"
                step="1"
                value={quantitySold}
                onChange={e => setQuantitySold(e.target.value)}
                placeholder="0"
              />
              <p className="text-xs text-gray-500">Necesario para el análisis de punto de equilibrio</p>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Calcular y guardar'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Live Preview */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-gray-500">Vista previa en tiempo real</CardTitle>
          </CardHeader>
          <CardContent>
            {preview ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Estado</span>
                  <StatusBadge status={preview.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Costo total</span>
                  <span className="font-semibold">{formatUYU(preview.cost_total)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Ganancia</span>
                  <span className={`font-semibold ${preview.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatUYU(preview.profit)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Margen</span>
                  <span className="font-semibold">{(preview.margin * 100).toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between border-t pt-4">
                  <span className="text-gray-600">Precio sugerido</span>
                  <span className="font-bold text-lg">{formatUYU(preview.suggested_price)}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">
                Completá el precio de venta para ver los resultados
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
