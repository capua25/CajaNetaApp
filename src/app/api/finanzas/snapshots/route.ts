import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { buildFinancialSummaryInCurrency } from '@/lib/finanzas'
import { buildSnapshotInsert } from '@/lib/snapshots'
import { getUsdToUyuRate } from '@/lib/exchange-rate'
import { isCurrency, type Currency } from '@/lib/currency'
import type { FixedCost, UserProfile } from '@/lib/types'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('users')
    .select('plan, display_currency')
    .eq('id', user.id)
    .single()

  const userProfile = profile as Pick<UserProfile, 'plan' | 'display_currency'> | null
  if (userProfile?.plan !== 'pro') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const rawNote = body?.note
  let note: string | null = null
  if (rawNote !== undefined && rawNote !== null && rawNote !== '') {
    if (typeof rawNote !== 'string' || rawNote.length > 200) {
      return NextResponse.json({ error: 'Invalid note' }, { status: 400 })
    }
    note = rawNote.trim()
  }

  const displayCurrency: Currency = isCurrency(userProfile.display_currency)
    ? userProfile.display_currency
    : 'UYU'

  const [
    { data: products, error: productsError },
    { data: fixedCosts, error: costsError },
    rateInfo,
  ] = await Promise.all([
    supabase
      .from('products')
      .select('id, name, price, cost, expenses, quantity_sold, currency')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('fixed_costs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    getUsdToUyuRate(user.id),
  ])

  if (productsError) {
    console.error('[snapshots] DB error (products):', productsError.message)
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 })
  }
  if (costsError) {
    console.error('[snapshots] DB error (fixed-costs):', costsError.message)
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 })
  }

  const typedFixedCosts = (fixedCosts ?? []) as FixedCost[]

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
    typedFixedCosts,
    displayCurrency,
    rateInfo.rate
  )

  const insertPayload = buildSnapshotInsert({
    userId: user.id,
    summary,
    fixedCosts: typedFixedCosts,
    displayCurrency,
    usdToUyuRate: rateInfo.rate,
    note,
  })

  const { data: snapshot, error } = await supabase
    .from('finanzas_snapshots')
    .insert(insertPayload)
    .select()
    .single()

  if (error) {
    console.error('[snapshots] DB error (insert):', error.message)
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 })
  }

  return NextResponse.json(snapshot, { status: 201 })
}

export async function GET(request: Request) {
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

  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  let query = supabase
    .from('finanzas_snapshots')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (from) {
    const fromDate = new Date(from)
    if (Number.isNaN(fromDate.getTime())) {
      return NextResponse.json({ error: 'Invalid from date' }, { status: 400 })
    }
    query = query.gte('created_at', fromDate.toISOString())
  } else if (!to) {
    // Default: last 30 days when no range is provided
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    query = query.gte('created_at', thirtyDaysAgo.toISOString())
  }

  if (to) {
    const toDate = new Date(to)
    if (Number.isNaN(toDate.getTime())) {
      return NextResponse.json({ error: 'Invalid to date' }, { status: 400 })
    }
    toDate.setHours(23, 59, 59, 999)
    query = query.lte('created_at', toDate.toISOString())
  }

  const { data: snapshots, error } = await query

  if (error) {
    console.error('[snapshots] DB error (list):', error.message)
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 })
  }

  return NextResponse.json(snapshots, {
    headers: { 'Cache-Control': 'private, max-age=30' },
  })
}
