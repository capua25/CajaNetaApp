'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { ProductWithMix } from '@/lib/types'

interface ProductMixTableProps {
  initialProducts: ProductWithMix[]
  has_quantity_data: boolean
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
            {products.map((p) => (
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
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/product/${p.id}/edit`} className="text-sm text-blue-600 hover:underline">
                      Editar
                    </Link>
                    {confirmId === p.id ? (
                      <>
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={deletingId === p.id}
                          className="text-sm text-red-600 hover:underline disabled:opacity-50"
                        >
                          {deletingId === p.id ? 'Eliminando...' : '¿Eliminar?'}
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="text-sm text-muted-foreground hover:underline"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setConfirmId(p.id)}
                        disabled={deletingId === p.id}
                        className="text-sm text-red-600 hover:underline disabled:opacity-50"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
