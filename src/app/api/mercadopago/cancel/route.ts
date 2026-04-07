import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { cancelPreapproval, getPreapproval } from '@/lib/mercadopago'
import type { UserProfile } from '@/lib/types'

export async function POST() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile, error: dbError } = await supabase
    .from('users')
    .select('plan_status, mp_subscription_id')
    .eq('id', user.id)
    .single()

  if (dbError || !profile) {
    return NextResponse.json({ error: 'DB_ERROR' }, { status: 500 })
  }

  const { plan_status, mp_subscription_id } = profile as UserProfile

  if (plan_status !== 'active' || !mp_subscription_id) {
    return NextResponse.json({ error: 'NO_ACTIVE_SUBSCRIPTION' }, { status: 409 })
  }

  let expiresAt: string | null = null
  try {
    const preapproval = await getPreapproval(mp_subscription_id)
    expiresAt = preapproval.next_payment_date ?? null
  } catch {
    // proceed without expiry date
  }

  try {
    await cancelPreapproval(mp_subscription_id)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: 'MP_API_ERROR', detail: message }, { status: 502 })
  }

  const serviceSupabase = createServiceClient()
  const { error: updateError } = await serviceSupabase
    .from('users')
    .update({ plan_status: 'cancelled', plan_expires_at: expiresAt })
    .eq('id', user.id)

  if (updateError) {
    return NextResponse.json({ error: 'DB_ERROR' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
