'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { FixedCost, Recurrence } from '@/lib/types'

const RECURRENCE_LABELS: Record<Recurrence, string> = {
  monthly: 'Mensual',
  annual: 'Anual',
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: 'UYU',
    maximumFractionDigits: 0,
  }).format(value)
}

interface EditState {
  id: string
  name: string
  amount: string
  recurrence: Recurrence
}

interface FixedCostManagerProps {
  initialCosts: FixedCost[]
}

export function FixedCostManager({ initialCosts }: FixedCostManagerProps) {
  const router = useRouter()
  const [costs, setCosts] = useState<FixedCost[]>(initialCosts)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Add form state
  const [showAddForm, setShowAddForm] = useState(false)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [recurrence, setRecurrence] = useState<Recurrence>('monthly')

  // Inline edit state
  const [editState, setEditState] = useState<EditState | null>(null)
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const parsedAmount = parseFloat(amount)
    if (!name.trim() || isNaN(parsedAmount) || parsedAmount < 0) {
      setError('Completá nombre y monto correctamente.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/fixed-costs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), amount: parsedAmount, recurrence }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Error al guardar')
      }
      const newCost: FixedCost = await res.json()
      setName('')
      setAmount('')
      setRecurrence('monthly')
      setShowAddForm(false)
      setCosts(prev => [newCost, ...prev])
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setSubmitting(false)
    }
  }

  function handleEditOpen(cost: FixedCost) {
    setEditState({
      id: cost.id,
      name: cost.name,
      amount: String(cost.amount),
      recurrence: cost.recurrence,
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

    const parsedAmount = parseFloat(editState.amount)
    if (!editState.name.trim() || isNaN(parsedAmount) || parsedAmount < 0) {
      setEditError('Completá nombre y monto correctamente.')
      return
    }

    setEditSubmitting(true)
    try {
      const res = await fetch('/api/fixed-costs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editState.id,
          name: editState.name.trim(),
          amount: parsedAmount,
          recurrence: editState.recurrence,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Error al guardar')
      }
      const updated: FixedCost = await res.json()
      setEditState(null)
      setCosts(prev => prev.map(c => c.id === updated.id ? updated : c))
      router.refresh()
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setEditSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    setError(null)
    setDeletingId(id)
    try {
      const res = await fetch(`/api/fixed-costs?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      if (!res.ok && res.status !== 204) {
        const data = await res.json()
        throw new Error(data.error ?? 'Error al eliminar')
      }
      setCosts(prev => prev.filter(c => c.id !== id))
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Costos Fijos</CardTitle>
        <Button size="sm" variant="outline" onClick={() => { setShowAddForm(v => !v); setError(null) }}>
          {showAddForm ? 'Cancelar' : 'Agregar'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add form */}
        {showAddForm && (
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor="cf-name">Nombre</Label>
                <Input
                  id="cf-name"
                  placeholder="Ej: Alquiler"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cf-amount">Monto</Label>
                <Input
                  id="cf-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cf-recurrence">Recurrencia</Label>
                <select
                  id="cf-recurrence"
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value as Recurrence)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="monthly">Mensual</option>
                  <option value="annual">Anual</option>
                </select>
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </form>
        )}

        {/* Costs list */}
        {costs.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No hay costos fijos registrados.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg ring-1 ring-foreground/10">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Nombre</th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">Monto</th>
                  <th className="px-4 py-2 text-center font-medium text-muted-foreground">Recurrencia</th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">Equiv. mensual</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {costs.map((cost) =>
                  editState?.id === cost.id ? (
                    <tr key={cost.id}>
                      <td colSpan={5} className="px-4 py-3">
                        <form onSubmit={handleEditSave} className="flex flex-wrap items-end gap-3">
                          <div className="space-y-1">
                            <Label htmlFor={`edit-name-${cost.id}`}>Nombre</Label>
                            <Input
                              id={`edit-name-${cost.id}`}
                              value={editState.name}
                              onChange={(e) => setEditState({ ...editState, name: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={`edit-amount-${cost.id}`}>Monto</Label>
                            <Input
                              id={`edit-amount-${cost.id}`}
                              type="number"
                              min="0"
                              step="0.01"
                              value={editState.amount}
                              onChange={(e) => setEditState({ ...editState, amount: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={`edit-recurrence-${cost.id}`}>Recurrencia</Label>
                            <select
                              id={`edit-recurrence-${cost.id}`}
                              value={editState.recurrence}
                              onChange={(e) =>
                                setEditState({ ...editState, recurrence: e.target.value as Recurrence })
                              }
                              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            >
                              <option value="monthly">Mensual</option>
                              <option value="annual">Anual</option>
                            </select>
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
                    <tr key={cost.id}>
                      <td className="px-4 py-2 font-medium">{cost.name}</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(cost.amount)}</td>
                      <td className="px-4 py-2 text-center">{RECURRENCE_LABELS[cost.recurrence]}</td>
                      <td className="px-4 py-2 text-right">
                        {formatCurrency(
                          cost.recurrence === 'annual' ? cost.amount / 12 : cost.amount
                        )}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditOpen(cost)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(cost.id)}
                            disabled={deletingId === cost.id}
                          >
                            {deletingId === cost.id ? 'Eliminando...' : 'Eliminar'}
                          </Button>
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
