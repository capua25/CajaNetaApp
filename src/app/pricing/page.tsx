import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PLAN_CONFIGS } from '@/lib/plan-config'
import type { Plan } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SubscribeButton } from '@/components/billing/SubscribeButton'
function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 flex-shrink-0" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  let userPlan: Plan | null = null
  let userPlanStatus: string = 'free'
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('plan, plan_status')
      .eq('id', user.id)
      .single()
    userPlan = (profile?.plan ?? 'free') as Plan
    userPlanStatus = profile?.plan_status ?? 'free'
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Planes simples</h1>
        <p className="text-gray-600 text-lg">Empezá gratis, crecé cuando estés listo.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {PLAN_CONFIGS.map((plan) => {
          const isActive = userPlan === plan.key
          const borderClass = isActive ? plan.activeBorderClass : plan.borderClass

          return (
            <Card key={plan.key} className={borderClass}>
              <CardHeader>
                <CardTitle className="text-2xl">{plan.label}</CardTitle>
                <p className="text-3xl font-bold text-gray-900">
                  {plan.priceDisplay}
                  {plan.priceSuffix && (
                    <span className="text-base font-normal text-gray-500">{plan.priceSuffix}</span>
                  )}
                </p>
                {isActive && (
                  <span className={`text-sm font-normal ${plan.activeLabelClass}`}>Plan activo</span>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-gray-700">
                      <CheckIcon />
                      {feature}
                    </li>
                  ))}
                </ul>
                {plan.key === 'free' ? (
                  !user ? (
                    <Link href="/auth/register" className="block">
                      <Button variant="outline" className="w-full">Empezar gratis</Button>
                    </Link>
                  ) : (
                    <Button variant="outline" className="w-full" disabled>Plan actual</Button>
                  )
                ) : !user ? (
                  <Link href="/auth/register" className="block">
                    <Button variant="outline" className="w-full">Registrate para suscribirte</Button>
                  </Link>
                ) : isActive && userPlanStatus === 'active' ? (
                  <Button className="w-full" disabled>Plan activo</Button>
                ) : (
                  <SubscribeButton
                    plan={plan.key as 'plus' | 'pro'}
                    label={`Suscribirme al ${plan.label}`}
                  />
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </main>
  )
}
