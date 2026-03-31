import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { BillingCard } from '@/components/billing/BillingCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PLAN_CONFIGS } from '@/lib/plan-config'
import type { UserProfile } from '@/lib/types'

export default async function CuentaPage() {
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
