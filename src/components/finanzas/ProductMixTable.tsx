'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ProductWithMix } from '@/lib/types'

interface ProductMixTableProps {
  initialProducts: ProductWithMix[]
  has_quantity_data: boolean
}

interface ProductEditState {
  id: string
  name: string
  price: string
  cost: string
  expenses: string
  quantity_sold: string
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: 'UYU',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatPct(value: number | null): string {
  if (value === null) return '—'
  return `${(value * 100).toFixed(1)}%`
}

function formatNumber(value: number | null, decimals = 0): string {
  if (value === null) return '—'
  return new Intl.NumberFormat('es-UY', { maximumFractionDigits: decimals }).format(value)
}

export function ProductMixTable({ initialProducts, has_quantity_data }: ProductMixTableProps) {
  const router = useRouter()
  const [products, setProducts] = useState(initialProducts)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [editState, setEditState] = useState<ProductEditState | null>(null)
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setDeletingId(id)
    setConfirmId(null)
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' })
      setProducts(prev => prev.filter(p => p.id !== id))
      router.refresh()
    } finally {
      setDeletingId(null)
    }
  }

  function handleEditOpen(p: ProductWithMix) {
    setEditState({
      id: p.id,
      name: p.name,
      price: String(p.price),
      cost: String(p.cost),
      expenses: String(p.expenses),
      quantity_sold: String(p.quantity_sold),
    })
    setEditError(null)
  }

  function handleEditCancel() {
    setEditState(null)
    setEditError(null)
  }

  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault()
    if (!editState) return
    setEditError(null)
    setEditSubmitting(true)
    try {
      const res = await fetch(`/api/products/${editState.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editState.name.trim(),
          price: Number(editState.price),
          cost: Number(editState.cost),
          expenses: Number(editState.expenses),
          quantity_sold: parseInt(editState.quantity_sold) || 0,
          desired_margin: 0.3,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Error al guardar')
      }
      const updated = await res.json()
      const cost = Number(updated.cost)
      const expenses = Number(updated.expenses)
      const price = Number(updated.price)
      const cv = cost + expenses
      const rawMc = price - cv
      const mc = rawMc <= 0 ? null : rawMc
      const rc = mc !== null && price > 0 ? mc / price : null
      const quantity_sold = Number(updated.quantity_sold)
      const revenue = price * quantity_sold
      const totalQty = products.reduce((sum, p) => p.id === updated.id ? sum + quantity_sold : sum + p.quantity_sold, 0)
      setProducts(prev =>
        prev.map(p => {
          if (p.id !== updated.id) return p
          return {
            id: updated.id,
            name: updated.name,
            price,
            cost,
            expenses,
            cv,
            mc,
            rc,
            quantity_sold,
            revenue,
            weight: totalQty > 0 ? quantity_sold / totalQty : 0,
          }
        })
      )
      setEditState(null)
      router.refresh()
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setEditSubmitting(false)
    }
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No hay productos para mostrar.
      </div>
    )
  }

  const hasZeroQty = products.some((p) => p.quantity_sold === 0)

  return (
    <div className="space-y-3">
      {!has_quantity_data && (
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-800">
          Ingresá cantidades vendidas para ver el análisis de mix de productos.
        </div>
      )}

      {has_quantity_data && hasZeroQty && (
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-800">
          Algunos productos tienen cantidad vendida = 0 y no se incluyen en el cálculo del mix.
        </div>
      )}

      <div className="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Producto</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Precio</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">CV</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">MC</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">RC%</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Unidades</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ingresos</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">% del mix</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((p) =>
              editState?.id === p.id ? (
                <tr key={p.id}>
                  <td colSpan={9} className="px-4 py-3">
                    <form onSubmit={handleEditSave} className="flex flex-wrap items-end gap-3">
                      <div className="space-y-1">
                        <Label htmlFor={`edit-name-${p.id}`}>Nombre</Label>
                        <Input
                          id={`edit-name-${p.id}`}
                          value={editState.name}
                          onChange={(e) => setEditState({ ...editState, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`edit-price-${p.id}`}>Precio</Label>
                        <Input
                          id={`edit-price-${p.id}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={editState.price}
                          onChange={(e) => setEditState({ ...editState, price: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`edit-cost-${p.id}`}>Costo</Label>
                        <Input
                          id={`edit-cost-${p.id}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={editState.cost}
                          onChange={(e) => setEditState({ ...editState, cost: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`edit-expenses-${p.id}`}>Gastos</Label>
                        <Input
                          id={`edit-expenses-${p.id}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={editState.expenses}
                          onChange={(e) => setEditState({ ...editState, expenses: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`edit-qty-${p.id}`}>Unidades vendidas</Label>
                        <Input
                          id={`edit-qty-${p.id}`}
                          type="number"
                          min="0"
                          step="1"
                          value={editState.quantity_sold}
                          onChange={(e) => setEditState({ ...editState, quantity_sold: e.target.value })}
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" size="sm" disabled={editSubmitting}>
                          {editSubmitting ? 'Guardando...' : 'Guardar'}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleEditCancel}
                          disabled={editSubmitting}
                        >
                          Cancelar
                        </Button>
                      </div>
                      {editError && (
                        <p className="w-full text-sm text-destructive">{editError}</p>
                      )}
                    </form>
                  </td>
                </tr>
              ) : (
                <tr key={p.id} className={p.quantity_sold === 0 ? 'opacity-50' : ''}>
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(p.price)}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(p.cv)}</td>
                  <td className={`px-4 py-3 text-right font-medium ${(p.mc ?? 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {p.mc !== null ? formatCurrency(p.mc) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">{formatPct(p.rc)}</td>
                  <td className="px-4 py-3 text-right">
                    {p.quantity_sold === 0 ? (
                      <span className="text-muted-foreground italic text-xs">sin datos</span>
                    ) : (
                      formatNumber(p.quantity_sold)
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {p.quantity_sold > 0 ? formatCurrency(p.revenue) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {p.quantity_sold > 0 ? formatPct(p.weight) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditOpen(p)}
                      >
                        Editar
                      </Button>
                      {confirmId === p.id ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(p.id)}
                            disabled={deletingId === p.id}
                          >
                            {deletingId === p.id ? 'Eliminando...' : '¿Eliminar?'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setConfirmId(null)}
                          >
                            Cancelar
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setConfirmId(p.id)}
                          disabled={deletingId === p.id}
                        >
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
