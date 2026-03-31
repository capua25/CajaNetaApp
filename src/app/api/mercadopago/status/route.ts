import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPreapproval } from '@/lib/mercadopago'
import type { UserProfile } from '@/lib/types'

export async function GET() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile, error: dbError } = await supabase
    .from('users')
    .select('plan, plan_status, mp_subscription_id')
    .eq('id', user.id)
    .single()

  if (dbError || !profile) {
    return NextResponse.json({ error: 'DB_ERROR' }, { status: 500 })
  }

  const { plan, plan_status, mp_subscription_id } = profile as UserProfile

  if (!mp_subscription_id) {
    return NextResponse.json({ plan, plan_status, next_payment_date: null })
  }

  // Enrich with MP data — degrade gracefully on any failure
  try {
    const preapproval = await getPreapproval(mp_subscription_id)
    return NextResponse.json({
      plan,
      plan_status,
      next_payment_date: preapproval.next_payment_date ?? null,
    })
  } catch {
    return NextResponse.json({ plan, plan_status, next_payment_date: null })
  }
}
