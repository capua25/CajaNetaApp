'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { SubscribeButton } from '@/components/billing/SubscribeButton'
import type { Plan } from '@/lib/types'

interface FinanzasButtonProps {
  plan: Plan
}

const PRO_FEATURES = [
  'Punto de equilibrio en unidades e ingresos',
  'Margen de seguridad de tu negocio',
  'Mix de productos y contribución marginal',
  'Gestión de costos fijos mensuales',
]

export function FinanzasButton({ plan }: FinanzasButtonProps) {
  const [open, setOpen] = useState(false)

  if (plan === 'pro') {
    return (
      <Link href="/dashboard/finanzas">
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          Finanzas Avanzadas
          <Badge variant="default" className="text-xs">Pro</Badge>
        </Button>
      </Link>
    )
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        onClick={() => setOpen(true)}
      >
        Finanzas Avanzadas
        <Badge variant="default" className="text-xs">Pro</Badge>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Finanzas Avanzadas</DialogTitle>
            <DialogDescription>
              Herramientas de análisis financiero para entender la salud real de tu negocio.
            </DialogDescription>
          </DialogHeader>

          <ul className="space-y-2 text-sm text-muted-foreground">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">✓</span>
                {f}
              </li>
            ))}
          </ul>

          <div className="space-y-2 pt-2">
            <SubscribeButton plan="pro" label="Actualizar a Pro — UYU 450/mes" />
            <p className="text-xs text-muted-foreground text-center">
              Cancelás cuando querés. Sin permanencia.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
