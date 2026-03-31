'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface SubscribeButtonProps {
  plan: 'plus' | 'pro'
  label: string
}

export function SubscribeButton({ plan, label }: SubscribeButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/mercadopago/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError('No se pudo iniciar la suscripción. Intentá de nuevo.')
        return
      }

      window.location.href = data.init_point
    } catch {
      setError('No se pudo iniciar la suscripción. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button className="w-full" onClick={handleClick} disabled={loading}>
        {loading ? 'Cargando...' : label}
      </Button>
      {error && <p className="text-sm text-red-500 text-center">{error}</p>}
    </div>
  )
}
