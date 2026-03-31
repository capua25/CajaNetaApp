import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { buildFinancialSummary } from '@/lib/finanzas'
import type { FixedCost } from '@/lib/types'

export async function GET() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('users')
    .select('plan')
    .eq('id', user.id)
    .single()

  if (profile?.plan !== 'pro') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const [{ data: products, error: productsError }, { data: fixedCosts, error: costsError }] =
    await Promise.all([
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

  if (productsError) {
    return NextResponse.json({ error: productsError.message }, { status: 500 })
  }
  if (costsError) {
    return NextResponse.json({ error: costsError.message }, { status: 500 })
  }

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

  return NextResponse.json(summary)
}
