import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPreapproval } from '@/lib/mercadopago'
import { BillingCard } from '@/components/billing/BillingCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PLAN_CONFIGS } from '@/lib/plan-config'
import type { UserProfile } from '@/lib/types'

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
  // Link the subscription to this user so the webhook can find them
  const { preapproval_id } = await searchParams
  if (preapproval_id && !userProfile.mp_subscription_id) {
    try {
      const preapproval = await getPreapproval(preapproval_id)
      if (preapproval && preapproval.preapproval_plan_id) {
        await supabase
          .from('users')
          .update({ mp_subscription_id: preapproval_id, plan_status: 'pending' })
          .eq('id', user.id)
        userProfile.mp_subscription_id = preapproval_id
        userProfile.plan_status = 'pending'
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
