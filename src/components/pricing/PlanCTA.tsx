'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { PLAN_CONFIGS } from '@/lib/plan-config'
import { Button } from '@/components/ui/button'
import { SubscribeButton } from '@/components/billing/SubscribeButton'
import type { Plan } from '@/lib/types'

type AuthStatus =
  | { state: 'loading' }
  | { state: 'guest' }
  | { state: 'user'; plan: Plan; planStatus: string }

interface PlanCTAProps {
  planKey: Plan
}

export function PlanCTA({ planKey }: PlanCTAProps) {
  const [status, setStatus] = useState<AuthStatus>({ state: 'loading' })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        setStatus({ state: 'guest' })
        return
      }
      const { data } = await supabase
        .from('users')
        .select('plan, plan_status')
        .eq('id', user.id)
        .single()
      setStatus({
        state: 'user',
        plan: (data?.plan ?? 'free') as Plan,
        planStatus: data?.plan_status ?? 'free',
      })
    })
  }, [])

  const planConfig = PLAN_CONFIGS.find((p) => p.key === planKey)
  const planLabel = planConfig?.label ?? planKey

  if (status.state === 'loading') {
    return <Button variant="outline" className="w-full" disabled>Cargando...</Button>
  }

  if (planKey === 'free') {
    if (status.state === 'guest') {
      return (
        <Link href="/auth/register" className="block">
          <Button variant="outline" className="w-full">Empezar gratis</Button>
        </Link>
      )
    }
    return <Button variant="outline" className="w-full" disabled>Plan actual</Button>
  }

  // plus / pro
  if (status.state === 'guest') {
    return (
      <Link href="/auth/register" className="block">
        <Button variant="outline" className="w-full">Registrate para suscribirte</Button>
      </Link>
    )
  }

  const isActive = status.plan === planKey
  if (isActive && status.planStatus === 'active') {
    return <Button className="w-full" disabled>Plan activo</Button>
  }

  return (
    <SubscribeButton
      plan={planKey as 'plus' | 'pro'}
      label={`Suscribirme al ${planLabel}`}
    />
  )
}
