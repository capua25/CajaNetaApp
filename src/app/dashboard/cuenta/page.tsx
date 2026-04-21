import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DisplayCurrencySection } from '@/components/DisplayCurrencySection'
import { isCurrency, type Currency } from '@/lib/currency'
import { BillingCard } from '@/components/billing/BillingCard'
import { PendingPlanPoller } from '@/components/billing/PendingPlanPoller'
import { PreapprovalActivator } from '@/components/billing/PreapprovalActivator'
import { SubscribeButton } from '@/components/billing/SubscribeButton'
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PLAN_CONFIGS } from '@/lib/plan-config'
import { getPreapproval } from '@/lib/mercadopago'
import type { UserProfile } from '@/lib/types'

export default async function CuentaPage({
  searchParams,
}: {
  searchParams: Promise<{ preapproval_id?: string }>
}) {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('users')
    .select('id, email, plan, plan_status, mp_subscription_id, plan_expires_at, display_currency')
    .eq('id', user.id)
    .single()

  const userProfile = profile as UserProfile | null
  if (!userProfile) redirect('/auth/login')

  const displayCurrency: Currency = isCurrency(userProfile.display_currency)
    ? userProfile.display_currency
    : 'UYU'

  const { preapproval_id } = await searchParams

  const { plan } = userProfile

  let nextPaymentDate: string | null = null
  if (userProfile.mp_subscription_id && userProfile.plan_status === 'active') {
    try {
      const preapproval = await getPreapproval(userProfile.mp_subscription_id)
      nextPaymentDate = preapproval.next_payment_date ?? null
    } catch {
      // si falla MP, seguimos sin la fecha
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {preapproval_id && !userProfile?.mp_subscription_id && (
        <PreapprovalActivator preapprovalId={preapproval_id} />
      )}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mi cuenta</h1>
        <p className="text-gray-500 text-sm mt-1">{userProfile.email}</p>
      </div>

      {plan !== 'free' ? (
        <BillingCard
          plan={plan}
          planStatus={userProfile.plan_status ?? 'active'}
          mpSubscriptionId={userProfile.mp_subscription_id ?? null}
          nextPaymentDate={nextPaymentDate}
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
            <SubscribeButton plan="plus" label="Actualizar a Plus" />
            <SubscribeButton plan="pro" label="Actualizar a Pro" />
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Seguridad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Contraseña</span>
            <ChangePasswordForm />
          </div>
        </CardContent>
      </Card>
      <footer className="pt-4 border-t border-gray-200">
        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
          <a href="/legal/terminos" className="hover:text-gray-600 transition-colors">Términos y condiciones</a>
          <a href="/legal/privacidad" className="hover:text-gray-600 transition-colors">Política de privacidad</a>
          <a href="/legal/aviso-legal" className="hover:text-gray-600 transition-colors">Aviso legal</a>
        </nav>
      </footer>
    </main>
  )
}
