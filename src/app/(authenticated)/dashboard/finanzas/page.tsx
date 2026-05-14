import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCachedUser } from '@/lib/supabase/get-user'
import { buildFinancialSummaryInCurrency } from '@/lib/finanzas'
import { getUsdToUyuRate } from '@/lib/exchange-rate'
import { isCurrency, type Currency } from '@/lib/currency'
import { Button } from '@/components/ui/button'
import { SummaryCards } from '@/components/finanzas/SummaryCards'
import { ProductMixTable } from '@/components/finanzas/ProductMixTable'
import { FixedCostManager } from '@/components/finanzas/FixedCostManager'
import type { UserProfile, FixedCost } from '@/lib/types'

export default async function FinanzasPage() {
  const user = await getCachedUser()
  // user is guaranteed by (authenticated) layout — non-null assertion is safe
  const userId = user!.id

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('users')
    .select('*, display_currency')
    .eq('id', userId)
    .single()

  const userProfile = profile as UserProfile | null
  if (userProfile?.plan !== 'pro') redirect('/pricing')

  const displayCurrency: Currency = isCurrency(userProfile.display_currency)
    ? userProfile.display_currency
    : 'UYU'
  if (!isCurrency(userProfile.display_currency)) {
    console.error('[finanzas] invalid display_currency for user', userId)
  }

  const [{ data: products }, { data: fixedCosts }, rateInfo] =
    await Promise.all([
      supabase
        .from('products')
        .select('id, name, price, cost, expenses, quantity_sold, currency')
        .order('created_at', { ascending: false }),
      supabase
        .from('fixed_costs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      getUsdToUyuRate(userId),
    ])

  const summary = buildFinancialSummaryInCurrency(
    (products ?? []) as Array<{
      id: string
      name: string
      price: number
      cost: number
      expenses: number
      quantity_sold: number
      currency: Currency
    }>,
    (fixedCosts ?? []) as FixedCost[],
    displayCurrency,
    rateInfo.rate
  )

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finanzas Avanzadas</h1>
          <p className="text-gray-500 text-sm mt-1">{user!.email}</p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline" size="sm">Mis productos</Button>
        </Link>
      </div>

      <SummaryCards summary={summary} currency={displayCurrency} />

      <FixedCostManager initialCosts={fixedCosts ?? []} />

      <ProductMixTable initialProducts={summary.products} has_quantity_data={summary.has_quantity_data} currency={displayCurrency} />
    </main>
  )
}
