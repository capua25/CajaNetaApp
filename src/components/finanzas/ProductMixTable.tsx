'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BulkSalesModal } from '@/components/dashboard/BulkSalesModal'
import { CurrencySelector } from '@/components/CurrencySelector'
import type { ProductWithMix, Currency } from '@/lib/types'
import { formatCurrency } from '@/lib/currency'

interface ProductMixTableProps {
  initialProducts: ProductWithMix[]
  has_quantity_data: boolean
  currency: Currency
}

interface ProductEditState {
  id: string
  name: string
  price: string
  cost: string
  expenses: string
  quantity_sold: string
  currency: Currency
}

function formatPct(value: number | null): string {
  if (value === null) return '—'
  return `${(value * 100).toFixed(1)}%`
}

function formatNumber(value: number | null, decimals = 0): string {
  if (value === null) return '—'
  return new Intl.NumberFormat('es-UY', { maximumFractionDigits: decimals }).format(value)
}

function recalcWeights(products: ProductWithMix[]): ProductWithMix[] {
  const totalQty = products.reduce((sum, p) => sum + p.quantity_sold, 0)
  return products.map((p) => ({
    ...p,
    weight: totalQty > 0 ? p.quantity_sold / totalQty : 0,
  }))
}

export function ProductMixTable({ initialProducts, has_quantity_data, currency }: ProductMixTableProps) {
  const router = useRouter()
  const [products, setProducts] = useState(initialProducts)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [editState, setEditState] = useState<ProductEditState | null>(null)
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  const [showAddForm, setShowAddForm] = useState(false)
  const [bulkSalesOpen, setBulkSalesOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newCost, setNewCost] = useState('')
  const [newExpenses, setNewExpenses] = useState('')
  const [newQty, setNewQty] = useState('')
  const [newCurrency, setNewCurrency] = useState<Currency>('UYU')
  const [addSubmitting, setAddSubmitting] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setAddError(null)
    setAddSubmitting(true)
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          price: Number(newPrice),
          cost: Number(newCost),
          expenses: Number(newExpenses),
          quantity_sold: parseInt(newQty) || 0,
          desired_margin: 0.3,
          currency: newCurrency,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Error al guardar')
      }
      const created = await res.json()
      const cost = Number(created.cost)
      const expenses = Number(created.expenses)
      const price = Number(created.price)
      const cv = cost + expenses
      const rawMc = price - cv
      const mc = rawMc <= 0 ? null : rawMc
      const rc = mc !== null && price > 0 ? mc / price : null
      const quantity_sold = Number(created.quantity_sold)
      const revenue = price * quantity_sold
      setProducts(prev => recalcWeights([{
        id: created.id, name: created.name, price, cost, expenses,
        currency: created.currency ?? 'UYU',
        cv, mc, rc, quantity_sold, revenue, weight: 0,
      }, ...prev]))
      setNewName(''); setNewPrice(''); setNewCost(''); setNewExpenses(''); setNewQty(''); setNewCurrency('UYU')
      setShowAddForm(false)
      router.refresh()
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setAddSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    setConfirmId(null)
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' })
      setProducts(prev => recalcWeights(prev.filter(p => p.id !== id)))
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
      currency: p.currency ?? 'UYU',
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
          currency: editState.currency,
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
      setProducts(prev =>
        recalcWeights(prev.map(p => {
          if (p.id !== updated.id) return p
          return { id: updated.id, name: updated.name, price, cost, expenses, cv, mc, rc, quantity_sold, revenue, weight: 0 }
        }))
      )
      setEditState(null)
      router.refresh()
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setEditSubmitting(false)
    }
  }

  const hasZeroQty = products.some((p) => p.quantity_sold === 0)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Mix de productos</CardTitle>
        <div className="flex gap-2">
          {products.length > 0 && !showAddForm && (
            <Button size="sm" variant="outline" onClick={() => setBulkSalesOpen(true)}>
              Actualizar ventas mensuales
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => { setShowAddForm(v => !v); setAddError(null) }}>
            {showAddForm ? 'Cancelar' : '+ Agregar producto'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
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

        {showAddForm && (
          <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3 rounded-xl ring-1 ring-foreground/10 px-4 py-4">
            <div className="space-y-1">
              <Label htmlFor="new-name">Nombre</Label>
              <Input id="new-name" value={newName} onChange={e => setNewName(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-price">Precio</Label>
              <Input id="new-price" type="number" min="0" step="0.01" value={newPrice} onChange={e => setNewPrice(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-cost">Costo</Label>
              <Input id="new-cost" type="number" min="0" step="0.01" value={newCost} onChange={e => setNewCost(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-expenses">Gastos</Label>
              <Input id="new-expenses" type="number" min="0" step="0.01" value={newExpenses} onChange={e => setNewExpenses(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-qty">Unidades vendidas</Label>
              <Input id="new-qty" type="number" min="0" step="1" value={newQty} onChange={e => setNewQty(e.target.value)} />
            </div>
            <CurrencySelector
              id="new-currency"
              label="Moneda"
              value={newCurrency}
              onChange={setNewCurrency}
              disabled={addSubmitting}
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={addSubmitting}>
                {addSubmitting ? 'Guardando...' : 'Guardar'}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => { setShowAddForm(false); setAddError(null) }} disabled={addSubmitting}>
                Cancelar
              </Button>
            </div>
            {addError && <p className="w-full text-sm text-destructive">{addError}</p>}
          </form>
        )}

        <BulkSalesModal
          open={bulkSalesOpen}
          onClose={() => setBulkSalesOpen(false)}
          products={products}
          onSuccess={() => { setBulkSalesOpen(false); router.refresh() }}
        />

        {products.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No hay productos para mostrar.
          </div>
        ) : (
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
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ganancia mensual</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">% del mix</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((p) =>
              editState?.id === p.id ? (
                <tr key={p.id}>
                  <td colSpan={10} className="px-4 py-3">
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
                      <CurrencySelector
                        id={`edit-currency-${p.id}`}
                        label="Moneda"
                        value={editState.currency}
                        onChange={(v) => setEditState({ ...editState, currency: v })}
                        disabled={editSubmitting}
                      />
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
                  <td className="px-4 py-3 text-right">{formatCurrency(p.price, currency)}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(p.cv, currency)}</td>
                  <td className={`px-4 py-3 text-right font-medium ${(p.mc ?? 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {p.mc !== null ? formatCurrency(p.mc, currency) : '—'}
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
                    {p.quantity_sold > 0 ? formatCurrency(p.revenue, currency) : '—'}
                  </td>
                  <td className={`px-4 py-3 text-right font-medium ${p.quantity_sold > 0 ? ((p.mc ?? 0) >= 0 ? 'text-green-600' : 'text-red-600') : ''}`}>
                    {p.quantity_sold > 0 ? formatCurrency((p.mc ?? 0) * p.quantity_sold, currency) : '—'}
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
        )}
      </CardContent>
    </Card>
  )
}
