import { PLAN_CONFIGS } from '@/lib/plan-config'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PlanCTA } from '@/components/pricing/PlanCTA'
import type { Plan } from '@/lib/types'

export const dynamic = 'force-static'

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 flex-shrink-0" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export default function PricingPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Planes simples</h1>
        <p className="text-gray-600 text-lg">Empezá gratis, crecé cuando estés listo.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {PLAN_CONFIGS.map((plan) => (
          <Card key={plan.key} className={plan.borderClass}>
            <CardHeader>
              <CardTitle className="text-2xl">{plan.label}</CardTitle>
              <p className="text-3xl font-bold text-gray-900">
                {plan.priceDisplay}
                {plan.priceSuffix && (
                  <span className="text-base font-normal text-gray-500">{plan.priceSuffix}</span>
                )}
              </p>
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
              <PlanCTA planKey={plan.key as Plan} />
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}
