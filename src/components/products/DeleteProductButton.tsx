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
    if (!confirm('¿Eliminár este producto?')) return
    setLoading(true)

    await fetch(`/api/products/${productId}`, { method: 'DELETE' })
    router.refresh()
    setLoading(false)
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
