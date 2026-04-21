import { createClient } from '@/lib/supabase/server'
import { getUsdToUyuRate } from '@/lib/exchange-rate'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await getUsdToUyuRate(user.id)
  return NextResponse.json(result, {
    headers: { 'Cache-Control': 'private, max-age=300' },
  })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const rate = Number(body?.rate)
  if (!Number.isFinite(rate) || rate <= 0 || rate > 1000) {
    return NextResponse.json({ error: 'rate must be a positive number <= 1000' }, { status: 400 })
  }

  const today = new Date().toISOString().slice(0, 10)

  // Delete existing override for this user then insert fresh (same pattern as refreshGlobalUsdToUyuRate)
  await supabase
    .from('exchange_rates')
    .delete()
    .eq('user_id', user.id)
    .eq('from_currency', 'USD')
    .eq('to_currency', 'UYU')

  const { data, error } = await supabase
    .from('exchange_rates')
    .insert({
      user_id: user.id,
      from_currency: 'USD',
      to_currency: 'UYU',
      rate,
      source: 'manual',
      effective_date: today,
      updated_at: new Date().toISOString(),
    })
    .select('rate, source, effective_date')
    .single()

  if (error) {
    console.error('[exchange-rate] insert error:', error.message)
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 })
  }

  return NextResponse.json({
    rate: data.rate,
    source: data.source,
    effectiveDate: data.effective_date,
    stale: false,
  })
}

export async function DELETE() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('exchange_rates')
    .delete()
    .eq('user_id', user.id)
    .eq('from_currency', 'USD')
    .eq('to_currency', 'UYU')

  if (error) {
    console.error('[exchange-rate] delete error:', error.message)
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 })
  }

  return new Response(null, { status: 204 })
}
