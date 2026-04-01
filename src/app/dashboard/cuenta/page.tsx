import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPreapproval } from '@/lib/mercadopago'
import { BillingCard } from '@/components/billing/BillingCard'
import { PendingPlanPoller } from '@/components/billing/PendingPlanPoller'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PLAN_CONFIGS } from '@/lib/plan-config'
import type { Plan, UserProfile } from '@/lib/types'

export default async function CuentaPage({
  searchParams,
}: {
  searchParams: Promise<{ preapproval_id?: string }>
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('users')
    .select('id, email, plan, plan_status, mp_subscription_id')
    .eq('id', user.id)
    .single()

  const userProfile = profile as UserProfile | null
  if (!userProfile) redirect('/auth/login')

  // MP redirects here after checkout with ?preapproval_id=xxx
  // Activate immediately if already authorized, otherwise mark pending for webhook
  const { preapproval_id } = await searchParams
  if (preapproval_id && !userProfile.mp_subscription_id) {
    try {
      const preapproval = await getPreapproval(preapproval_id)
      if (preapproval?.preapproval_plan_id) {
        const planMap: Record<string, Plan> = {
          [process.env.MP_PLAN_ID_PLUS ?? '']: 'plus',
          [process.env.MP_PLAN_ID_PRO ?? '']: 'pro',
        }
        const mappedPlan = planMap[preapproval.preapproval_plan_id]

        if (preapproval.status === 'authorized' && mappedPlan) {
          await supabase
            .from('users')
            .update({ mp_subscription_id: preapproval_id, plan_status: 'active', plan: mappedPlan })
            .eq('id', user.id)
          userProfile.mp_subscription_id = preapproval_id
          userProfile.plan_status = 'active'
          userProfile.plan = mappedPlan
        } else {
          await supabase
            .from('users')
            .update({ mp_subscription_id: preapproval_id, plan_status: 'pending' })
            .eq('id', user.id)
          userProfile.mp_subscription_id = preapproval_id
          userProfile.plan_status = 'pending'
        }
      }
    } catch {
      // Non-fatal — webhook will still handle the status update
    }
  }

  const { plan } = userProfile

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mi cuenta</h1>
        <p className="text-gray-500 text-sm mt-1">{userProfile.email}</p>
      </div>

      {plan !== 'free' ? (
        <BillingCard
          plan={plan}
          planStatus={userProfile.plan_status ?? 'active'}
          mpSubscriptionId={userProfile.mp_subscription_id ?? null}
        />
      ) : userProfile.plan_status === 'pending' ? (
        <PendingPlanPoller />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mi suscripción</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Plan actual</span>
              <Badge variant="secondary">
                {PLAN_CONFIGS.find((p) => p.key === 'free')?.label ?? 'Gratis'}
              </Badge>
            </div>
            <p className="text-sm text-gray-500">
              Estás en el plan gratuito. Actualizá tu plan para desbloquear más productos y funciones avanzadas.
            </p>
            <Link href="/pricing">
              <Button size="sm" className="w-full">Ver planes</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </main>
  )
}
