'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { UpgradeModal } from '@/components/shared/UpgradeModal'
import { Plus } from 'lucide-react'

interface NewProductButtonProps {
  isFreeLimitReached: boolean
  plan: 'free' | 'plus'
  onNew?: () => void
}

export function NewProductButton({ isFreeLimitReached, plan, onNew }: NewProductButtonProps) {
  const [showModal, setShowModal] = useState(false)

  if (isFreeLimitReached) {
    return (
      <>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo producto
        </Button>
        <UpgradeModal isOpen={showModal} onClose={() => setShowModal(false)} plan={plan} />
      </>
    )
  }

  if (onNew) {
    return (
      <Button onClick={onNew}>
        <Plus className="h-4 w-4 mr-2" />
        Nuevo producto
      </Button>
    )
  }

  return (
    <Link href="/product/new">
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        Nuevo producto
      </Button>
    </Link>
  )
}
