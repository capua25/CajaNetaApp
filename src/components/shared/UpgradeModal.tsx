'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, X } from 'lucide-react'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
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
          <CardTitle className="text-xl">Límite del plan gratuito</CardTitle>
          <p className="text-gray-600">
            Ya usaste tu producto gratuito. Pasate a Pro para agregar productos ilimitados.
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
              Ver planes — UYU 450/mes
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
