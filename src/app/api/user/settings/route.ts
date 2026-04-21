import { createClient } from '@/lib/supabase/server'
import { isCurrency } from '@/lib/currency'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const updates: Record<string, unknown> = {}

  if (body?.display_currency !== undefined) {
    if (!isCurrency(body.display_currency)) {
      return NextResponse.json({ error: 'display_currency must be UYU or USD' }, { status: 400 })
    }
    updates.display_currency = body.display_currency
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', user.id)
    .select('id, display_currency')
    .single()

  if (error) {
    console.error('[user/settings] error:', error.message)
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 })
  }

  return NextResponse.json(data)
}
