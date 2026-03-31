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
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('¿Eliminar este producto?')) return
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
      router.refresh()
    } catch {
      alert('No se pudo eliminar el producto. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={loading || disabled}
    title={disabled ? 'Actualizate a Pro para eliminar productos' : undefined}
      className="text-red-500 hover:text-red-700 hover:bg-red-50"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}
