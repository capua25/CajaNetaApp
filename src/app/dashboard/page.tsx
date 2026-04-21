import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardProductsSection } from '@/components/dashboard/DashboardProductsSection'
import { FinanzasButton } from '@/components/dashboard/FinanzasButton'
import { SalesSummaryChart } from '@/components/dashboard/SalesSummaryChart'
import { PLAN_LIMITS } from '@/lib/plan-config'
import { isCurrency } from '@/lib/currency'
import type { UserProfile, Product, Plan } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) redirect('/auth/login')

  const [{ data: profile }, { data: products }] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('products').select('id, name, cost, expenses, price, desired_margin, quantity_sold').eq('user_id', user.id).order('created_at', { ascending: false }),
  ])

  const userProfile = profile as UserProfile | null
  const productList = (products ?? []) as unknown as Product[]
  const plan = (userProfile?.plan ?? 'free') as Plan
  const displayCurrency = isCurrency(userProfile?.display_currency) ? userProfile.display_currency : 'UYU'
  const limit = PLAN_LIMITS[plan]
  const isFreeLimitReached = limit !== Infinity && productList.length >= limit

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis productos</h1>
          <p className="text-gray-500 text-sm mt-1">{user.email}</p>
        </div>
        <FinanzasButton plan={plan} />
      </div>

      <SalesSummaryChart products={productList} />

      <DashboardProductsSection
        products={productList}
        isFreePlan={userProfile?.plan === 'free'}
        planStatus={userProfile?.plan_status}
        isFreeLimitReached={isFreeLimitReached}
        plan={plan}
      />
    </main>
  )
}
