import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function PATCH(request: Request) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [{ data: profile }, { count: productCount }] = await Promise.all([
    supabase.from('users').select('plan').eq('id', user.id).single(),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  if (profile?.plan === 'free') {
    return NextResponse.json({ error: 'FREE_PLAN_NOT_ALLOWED' }, { status: 403 })
  }

  const body = await request.json()
  const { updates } = body

  const actualCount = productCount ?? 0
  if (!Array.isArray(updates) || updates.length === 0 || updates.length > actualCount) {
    return NextResponse.json({ error: 'updates must be a non-empty array no larger than your product count' }, { status: 400 })
  }

  for (const item of updates) {
    if (!UUID_REGEX.test(item.id)) {
      return NextResponse.json({ error: `Invalid id: ${item.id}` }, { status: 400 })
    }
    if (!Number.isInteger(item.quantity_sold) || item.quantity_sold < 0) {
      return NextResponse.json({ error: 'quantity_sold must be a non-negative integer' }, { status: 400 })
    }
  }

  const results = await Promise.all(
    updates.map(({ id, quantity_sold }: { id: string; quantity_sold: number }) =>
      supabase
        .from('products')
        .update({ quantity_sold })
        .eq('id', id)
        .eq('user_id', user.id)
    )
  )

  const failed = results.filter(r => r.error)
  if (failed.length > 0) {
    console.error('[bulk-quantities] DB errors:', failed.map(r => r.error?.message))
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 })
  }

  return NextResponse.json({ updated: updates.length })
}
