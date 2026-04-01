import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [{ data: profileForEdit }, { count: productCount }] = await Promise.all([
    supabase.from('users').select('plan').eq('id', user.id).single(),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  if (profileForEdit?.plan === 'free' && (productCount ?? 0) > 1) {
    return NextResponse.json({ error: 'FREE_PLAN_OVER_LIMIT' }, { status: 403 })
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
    .update({
      name,
      cost: Number(cost),
      expenses: Number(expenses ?? 0),
      price: Number(price),
      desired_margin: Number(desired_margin ?? 0.3),
      ...(quantity_sold != null && { quantity_sold: Number(quantity_sold) }),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .maybeSingle()

  if (error) {
    console.error('[products] DB error:', error.message)
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 })
  }

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  return NextResponse.json(product)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [{ data: profile }, { count: productCount }] = await Promise.all([
    supabase.from('users').select('plan').eq('id', user.id).single(),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  if (profile?.plan === 'free' && (productCount ?? 0) <= 1) {
    return NextResponse.json({ error: 'FREE_PLAN_CANNOT_DELETE' }, { status: 403 })
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('[products] DB error:', error.message)
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
