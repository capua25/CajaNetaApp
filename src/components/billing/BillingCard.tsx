'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SubscribeButton } from '@/components/billing/SubscribeButton'
import { PLAN_CONFIGS } from '@/lib/plan-config'
import type { Plan } from '@/lib/types'

interface BillingCardProps {
  plan: Plan
  planStatus: string
  mpSubscriptionId: string | null
}

const STATUS_BADGE: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  active: { label: 'Activo', variant: 'default' },
  cancelled: { label: 'Cancelado', variant: 'secondary' },
  paused: { label: 'Pausado', variant: 'outline' },
}

export function BillingCard({ plan, planStatus: initialStatus, mpSubscriptionId }: BillingCardProps) {
  const [planStatus, setPlanStatus] = useState(initialStatus)
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)

  async function handleCancel() {
    setCancelling(true)
    setCancelError(null)

    try {
      const res = await fetch('/api/mercadopago/cancel', { method: 'POST' })
      if (!res.ok) {
        setCancelError('No se pudo cancelar. Intentá de nuevo.')
        return
      }
      setPlanStatus('cancelled')
    } catch {
      setCancelError('No se pudo cancelar. Intentá de nuevo.')
    } finally {
      setCancelling(false)
    }
  }

  const planConfig = PLAN_CONFIGS.find((p) => p.key === plan)
  const statusConfig = STATUS_BADGE[planStatus] ?? { label: planStatus, variant: 'outline' as const }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base">Mi suscripción</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Plan</span>
          <span className="font-medium">{planConfig?.label ?? plan}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Estado</span>
          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
        </div>

        {planStatus === 'active' && (
          <div className="pt-2 space-y-2">
            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? 'Cancelando...' : 'Cancelar suscripción'}
            </Button>
            {cancelError && <p className="text-sm text-red-500 text-center">{cancelError}</p>}
            <p className="text-xs text-gray-400 text-center">
              Tu acceso continúa hasta el próximo período de facturación.
            </p>
          </div>
        )}

        {planStatus === 'cancelled' && (
          <p className="text-xs text-gray-500 text-center pt-1">
            Suscripción cancelada. Tu acceso continúa hasta el próximo período de facturación.
          </p>
        )}

        {plan === 'plus' && planStatus === 'active' && (
          <div className="pt-3 border-t space-y-2">
            <p className="text-sm text-gray-500">
              Pasá a Pro para acceder a finanzas avanzadas: punto de equilibrio, mix de productos y más.
            </p>
            <SubscribeButton plan="pro" label="Actualizar a Pro" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
