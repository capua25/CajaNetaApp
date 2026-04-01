'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function PreapprovalActivator({ preapprovalId }: { preapprovalId: string }) {
  const router = useRouter()

  useEffect(() => {
    async function activate() {
      try {
        await fetch('/api/mercadopago/activate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ preapproval_id: preapprovalId }),
        })
      } finally {
        router.replace('/dashboard/cuenta')
        router.refresh()
      }
    }
    activate()
  }, [preapprovalId, router])

  return null
}
