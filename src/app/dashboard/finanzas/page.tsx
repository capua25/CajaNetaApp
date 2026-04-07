import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { buildFinancialSummary } from '@/lib/finanzas'
import { Button } from '@/components/ui/button'
import { SummaryCards } from '@/components/finanzas/SummaryCards'
import { ProductMixTable } from '@/components/finanzas/ProductMixTable'
import { FixedCostManager } from '@/components/finanzas/FixedCostManager'
import type { UserProfile, FixedCost } from '@/lib/types'

export default async function FinanzasPage() {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const userProfile = profile as UserProfile | null
  if (userProfile?.plan !== 'pro') redirect('/pricing')

  const [{ data: products }, { data: fixedCosts }] = await Promise.all([
    supabase
      .from('products')
      .select('id, name, price, cost, expenses, quantity_sold')
      .order('created_at', { ascending: false }),
    supabase
      .from('fixed_costs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  const summary = buildFinancialSummary(
    (products ?? []) as Array<{
      id: string
      name: string
      price: number
      cost: number
      expenses: number
      quantity_sold: number
    }>,
    (fixedCosts ?? []) as FixedCost[]
  )

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finanzas Avanzadas</h1>
          <p className="text-gray-500 text-sm mt-1">{user.email}</p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline" size="sm">Mis productos</Button>
        </Link>
      </div>

      <SummaryCards summary={summary} />

      <FixedCostManager initialCosts={fixedCosts ?? []} />

      <ProductMixTable initialProducts={summary.products} has_quantity_data={summary.has_quantity_data} />
    </main>
  )
}
