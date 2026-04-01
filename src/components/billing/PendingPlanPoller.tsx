'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const BACKOFF_DELAYS = [2000, 3000, 5000, 8000, 13000, 21000, 34000]

export function PendingPlanPoller() {
  const router = useRouter()
  const indexRef = useRef(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    async function poll() {
      try {
        const res = await fetch('/api/mercadopago/status')
        const data: { plan?: string } = await res.json()
        if (data.plan && data.plan !== 'free') {
          router.refresh()
          return
        }
      } catch {
        // ignorar, seguir intentando
      }

      const nextIndex = indexRef.current + 1
      if (nextIndex >= BACKOFF_DELAYS.length) {
        setTimedOut(true)
        return
      }
      indexRef.current = nextIndex
      timeoutRef.current = setTimeout(poll, BACKOFF_DELAYS[nextIndex])
    }

    timeoutRef.current = setTimeout(poll, BACKOFF_DELAYS[0])

    return () => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current)
    }
  }, [router])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Mi suscripción</CardTitle>
      </CardHeader>
      <CardContent className="py-4 space-y-3">
        {timedOut ? (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Estado</span>
              <Badge variant="outline">Pendiente de confirmación</Badge>
            </div>
            <p className="text-sm text-gray-500">
              Tu pago está siendo verificado. Si abonaste en una red de cobranza, la confirmación
              puede demorar hasta 48hs hábiles. Tu plan se activará automáticamente cuando
              el pago sea acreditado.
            </p>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <span className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
            <p className="text-sm text-gray-500">
              Estamos procesando tu pago, aguardá un momento...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
