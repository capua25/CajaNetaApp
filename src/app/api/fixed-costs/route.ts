import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isCurrency } from '@/lib/currency'
import type { Recurrence } from '@/lib/types'

const VALID_RECURRENCES: Recurrence[] = ['monthly', 'annual']
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: fixedCosts, error } = await supabase
    .from('fixed_costs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[fixed-costs] DB error:', error.message)
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 })
  }

  return NextResponse.json(fixedCosts, {
    headers: { 'Cache-Control': 'private, max-age=60' },
  })
}

export async function POST(request: Request) {
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

  const body = await request.json()
  const { name, amount, recurrence, currency } = body

  if (!name || amount == null || !recurrence) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (typeof name !== 'string' || name.trim() === '' || name.length > 200) {
    return NextResponse.json({ error: 'Invalid name' }, { status: 400 })
  }

  if (typeof amount !== 'number' || amount < 0) {
    return NextResponse.json({ error: 'amount must be a non-negative number' }, { status: 400 })
  }

  if (!VALID_RECURRENCES.includes(recurrence as Recurrence)) {
    return NextResponse.json({ error: 'recurrence must be monthly or annual' }, { status: 400 })
  }

  if (currency !== undefined && !isCurrency(currency)) {
    return NextResponse.json({ error: 'currency must be UYU or USD' }, { status: 400 })
  }

  const { data: fixedCost, error } = await supabase
    .from('fixed_costs')
    .insert({
      user_id: user.id,
      name: name.trim(),
      amount: Number(amount),
      recurrence: recurrence as Recurrence,
      currency: currency ?? 'UYU',
    })
    .select()
    .single()

  if (error) {
    console.error('[fixed-costs] DB error:', error.message)
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 })
  }

  return NextResponse.json(fixedCost, { status: 201 })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { id, name, amount, recurrence, currency } = body

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}
  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim() === '' || name.length > 200) {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 })
    }
    updates.name = name.trim()
  }
  if (amount !== undefined) {
    if (typeof amount !== 'number' || amount < 0) {
      return NextResponse.json({ error: 'amount must be a non-negative number' }, { status: 400 })
    }
    updates.amount = Number(amount)
  }
  if (recurrence !== undefined) {
    if (!VALID_RECURRENCES.includes(recurrence as Recurrence)) {
      return NextResponse.json({ error: 'recurrence must be monthly or annual' }, { status: 400 })
    }
    updates.recurrence = recurrence as Recurrence
  }
  if (currency !== undefined) {
    if (!isCurrency(currency)) {
      return NextResponse.json({ error: 'currency must be UYU or USD' }, { status: 400 })
    }
    updates.currency = currency
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  // Ownership enforced via RLS + explicit user_id filter
  const { data: fixedCost, error } = await supabase
    .from('fixed_costs')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('[fixed-costs] DB error:', error.message)
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 })
  }

  if (!fixedCost) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(fixedCost)
}

export async function DELETE(request: Request) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing id query parameter' }, { status: 400 })
  }
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  // Ownership enforced via RLS + explicit user_id filter
  const { error } = await supabase
    .from('fixed_costs')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('[fixed-costs] DB error:', error.message)
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 })
  }

  return new Response(null, { status: 204 })
}
