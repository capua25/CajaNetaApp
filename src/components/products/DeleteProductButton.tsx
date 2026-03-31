'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface DeleteProductButtonProps {
  productId: string
  disabled?: boolean
}

export function DeleteProductButton({ productId, disabled }: DeleteProductButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleConfirm() {
    setLoading(true)
    try {
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(data.error === 'FREE_PLAN_CANNOT_DELETE'
          ? 'Necesitás un plan pago para eliminar productos.'
          : 'No se pudo eliminar el producto. Intentá de nuevo.')
        return
      }
      setOpen(false)
      router.refresh()
    } catch {
      alert('No se pudo eliminar el producto. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        disabled={disabled}
        title={disabled ? 'Actualizate a Pro para eliminar productos' : undefined}
        className="text-red-500 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div className="absolute inset-0 bg-black/50" onClick={() => !loading && setOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6 space-y-4">
            <h2 id="delete-dialog-title" className="text-base font-semibold text-gray-900">
              ¿Eliminar producto?
            </h2>
            <p className="text-sm text-gray-500">
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
