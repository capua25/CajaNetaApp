import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
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

  if (profile?.plan === 'free') {
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if ((count ?? 0) >= 1) {
      return NextResponse.json({ error: 'PLAN_LIMIT_REACHED' }, { status: 403 })
    }
  }

  const body = await request.json()
  const { name, cost, expenses, price, desired_margin, quantity_sold } = body

  if (!name || cost == null || price == null) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
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
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(product, { status: 201 })
}
