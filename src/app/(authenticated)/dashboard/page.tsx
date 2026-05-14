import { createClient } from '@/lib/supabase/server'
import { getCachedUser } from '@/lib/supabase/get-user'
import { DashboardProductsSection } from '@/components/dashboard/DashboardProductsSection'
import { FinanzasButton } from '@/components/dashboard/FinanzasButton'
import { SalesSummaryChart } from '@/components/dashboard/SalesSummaryChart'
import { PLAN_LIMITS } from '@/lib/plan-config'
import { isCurrency } from '@/lib/currency'
import { getUsdToUyuRate } from '@/lib/exchange-rate'
import type { UserProfile, Product, Plan } from '@/lib/types'

export default async function DashboardPage() {
  const user = await getCachedUser()
  // user is guaranteed by (authenticated) layout — non-null assertion is safe
  const userId = user!.id

  const supabase = await createClient()
  const [{ data: profile }, { data: products }, exchangeRateResult] = await Promise.all([
    supabase.from('users').select('*').eq('id', userId).single(),
    supabase.from('products').select('id, name, cost, expenses, price, desired_margin, quantity_sold, currency, created_at').eq('user_id', userId).order('created_at', { ascending: false }),
    getUsdToUyuRate(userId),
  ])

  const userProfile = profile as UserProfile | null
  const productList = (products ?? []) as unknown as Product[]
  const plan = (userProfile?.plan ?? 'free') as Plan
  const displayCurrency = isCurrency(userProfile?.display_currency) ? userProfile.display_currency : 'UYU'
  const exchangeRate = exchangeRateResult.rate
  const limit = PLAN_LIMITS[plan]
  const isFreeLimitReached = limit !== Infinity && productList.length >= limit

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis productos</h1>
          <p className="text-gray-500 text-sm mt-1">{user!.email}</p>
        </div>
        <FinanzasButton plan={plan} />
      </div>

      <SalesSummaryChart products={productList} currency={displayCurrency} exchangeRate={exchangeRate} />

      <DashboardProductsSection
        products={productList}
        isFreePlan={userProfile?.plan === 'free'}
        isFreeLimitReached={isFreeLimitReached}
        plan={plan}
      />
    </main>
  )
}
