'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const POLL_INTERVAL_MS = 3000
const MAX_RETRIES = 20 // ~1 minuto máximo — después se asume pago diferido (redes de cobranza, etc.)

export function PendingPlanPoller() {
  const router = useRouter()
  const retries = useRef(0)
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    const interval = setInterval(async () => {
      retries.current += 1
      if (retries.current > MAX_RETRIES) {
        clearInterval(interval)
        setTimedOut(true)
        return
      }

      try {
        const res = await fetch('/api/mercadopago/status')
        const data: { plan?: string } = await res.json()
        if (data.plan && data.plan !== 'free') {
          clearInterval(interval)
          router.refresh()
        }
      } catch {
        // ignorar, seguir intentando
      }
    }, POLL_INTERVAL_MS)

    return () => clearInterval(interval)
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
