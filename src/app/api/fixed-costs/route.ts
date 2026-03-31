import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { Recurrence } from '@/lib/types'

const VALID_RECURRENCES: Recurrence[] = ['monthly', 'annual']

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
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(fixedCosts)
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
  const { name, amount, recurrence } = body

  if (!name || amount == null || !recurrence) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (typeof name !== 'string' || name.trim() === '') {
    return NextResponse.json({ error: 'Invalid name' }, { status: 400 })
  }

  if (typeof amount !== 'number' || amount < 0) {
    return NextResponse.json({ error: 'amount must be a non-negative number' }, { status: 400 })
  }

  if (!VALID_RECURRENCES.includes(recurrence as Recurrence)) {
    return NextResponse.json({ error: 'recurrence must be monthly or annual' }, { status: 400 })
  }

  const { data: fixedCost, error } = await supabase
    .from('fixed_costs')
    .insert({
      user_id: user.id,
      name: name.trim(),
      amount: Number(amount),
      recurrence: recurrence as Recurrence,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
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
  const { id, name, amount, recurrence } = body

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}
  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim() === '') {
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
    return NextResponse.json({ error: error.message }, { status: 500 })
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

  // Ownership enforced via RLS + explicit user_id filter
  const { error } = await supabase
    .from('fixed_costs')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return new Response(null, { status: 204 })
}
