'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, X } from 'lucide-react'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  plan: 'free' | 'plus'
}

export function UpgradeModal({ isOpen, onClose, plan }: UpgradeModalProps) {
  const router = useRouter()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
        <CardHeader>
          <CardTitle className="text-xl">
            {plan === 'free' ? 'Límite del plan gratuito' : 'Límite del plan Plus'}
          </CardTitle>
          <p className="text-gray-600">
            {plan === 'free'
              ? 'Ya usaste tu producto gratuito. Elegí Plus (200 productos) o Pro (ilimitados).'
              : 'Llegaste al límite de 200 productos de tu plan Plus. Pasate a Pro para productos ilimitados.'}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Productos ilimitados</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Simulador de precios</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Insights automáticos</li>
          </ul>
          <div className="flex gap-3">
            <Button className="flex-1" onClick={() => router.push('/pricing')}>
              Ver planes
            </Button>
            <Button variant="outline" onClick={onClose}>
              Ahora no
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
