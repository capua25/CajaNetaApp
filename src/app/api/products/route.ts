import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { PLAN_LIMITS } from '@/lib/plan-config'
import type { Plan } from '@/lib/types'

export async function GET() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[products] DB error:', error.message)
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 })
  }

  return NextResponse.json(products)
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check plan limits
  const { data: profile } = await supabase
    .from('users')
    .select('plan')
    .eq('id', user.id)
    .single()

  const plan = (profile?.plan ?? 'free') as Plan
  const limit = PLAN_LIMITS[plan] ?? 1
  if (limit !== Infinity) {
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if ((count ?? 0) >= limit) {
      return NextResponse.json({ error: 'PLAN_LIMIT_REACHED' }, { status: 403 })
    }
  }

  const body = await request.json()
  const { name, cost, expenses, price, desired_margin, quantity_sold } = body

  if (typeof name !== 'string' || name.trim().length === 0 || name.length > 200) {
    return NextResponse.json({ error: 'Invalid name' }, { status: 400 })
  }
  if (typeof cost !== 'number' || !Number.isFinite(cost) || cost < 0) {
    return NextResponse.json({ error: 'cost must be a non-negative finite number' }, { status: 400 })
  }
  if (typeof price !== 'number' || !Number.isFinite(price) || price < 0) {
    return NextResponse.json({ error: 'price must be a non-negative finite number' }, { status: 400 })
  }
  if (expenses !== undefined && (typeof expenses !== 'number' || !Number.isFinite(expenses) || expenses < 0)) {
    return NextResponse.json({ error: 'expenses must be a non-negative finite number' }, { status: 400 })
  }
  if (quantity_sold !== undefined && (!Number.isInteger(quantity_sold) || quantity_sold < 0)) {
    return NextResponse.json({ error: 'quantity_sold must be a non-negative integer' }, { status: 400 })
  }

  const { data: product, error } = await supabase
    .from('products')
    .insert({
      user_id: user.id,
      name,
      cost: Number(cost),
      expenses: Number(expenses ?? 0),
      price: Number(price),
      desired_margin: Number(desired_margin ?? 0.3),
      quantity_sold: Number(quantity_sold ?? 0),
    })
    .select()
    .single()

  if (error) {
    console.error('[products] DB error:', error.message)
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 })
  }

  return NextResponse.json(product, { status: 201 })
}
