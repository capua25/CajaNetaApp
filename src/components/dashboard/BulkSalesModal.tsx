'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
interface ProductEntry {
  id: string
  name: string
  quantity_sold: number
}

interface BulkSalesModalProps {
  open: boolean
  onClose: () => void
  products: ProductEntry[]
  onSuccess: () => void
}

export function BulkSalesModal({ open, onClose, products, onSuccess }: BulkSalesModalProps) {
  const [quantities, setQuantities] = useState<Record<string, string>>(
    () => Object.fromEntries(products.map(p => [p.id, String(p.quantity_sold ?? 0)]))
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleChange(id: string, value: string) {
    setQuantities(prev => ({ ...prev, [id]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const updates = products.map(p => ({
      id: p.id,
      quantity_sold: Math.max(0, parseInt(quantities[p.id] ?? '0', 10) || 0),
    }))

    const res = await fetch('/api/products/bulk-quantities', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates }),
    })

    if (!res.ok) {
      setError('Ocurrió un error. Intentá de nuevo.')
      setLoading(false)
      return
    }

    setLoading(false)
    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Actualizar ventas mensuales</DialogTitle>
          <DialogDescription>
            Ingresá cuántas unidades vendiste este mes de cada producto.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          {products.map(product => (
            <div key={product.id} className="flex items-center gap-4">
              <Label htmlFor={`qty-${product.id}`} className="flex-1 text-sm truncate" title={product.name}>
                {product.name}
              </Label>
              <Input
                id={`qty-${product.id}`}
                type="number"
                min="0"
                step="1"
                value={quantities[product.id] ?? '0'}
                onChange={e => handleChange(product.id, e.target.value)}
                className="w-28 shrink-0"
              />
            </div>
          ))}
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
