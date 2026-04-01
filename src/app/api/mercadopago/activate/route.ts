import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPreapproval } from '@/lib/mercadopago'
import type { Plan } from '@/lib/types'

const PLAN_MAP: () => Record<string, Plan> = () => ({
  [process.env.MP_PLAN_ID_PLUS ?? '']: 'plus',
  [process.env.MP_PLAN_ID_PRO ?? '']: 'pro',
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const preapprovalId: string = body.preapproval_id
  if (!preapprovalId) return NextResponse.json({ error: 'Missing preapproval_id' }, { status: 400 })

  const { data: profile } = await supabase
    .from('users')
    .select('mp_subscription_id')
    .eq('id', user.id)
    .single()

  if (profile?.mp_subscription_id) {
    const { data: full } = await supabase.from('users').select('plan, plan_status').eq('id', user.id).single()
    return NextResponse.json({ plan: full?.plan, plan_status: full?.plan_status })
  }

  let preapproval
  try {
    preapproval = await getPreapproval(preapprovalId)
  } catch {
    return NextResponse.json({ error: 'MP_UNREACHABLE' }, { status: 503 })
  }

  if (preapproval.status !== 'authorized') {
    return NextResponse.json({ plan_status: preapproval.status })
  }

  const plan = PLAN_MAP()[preapproval.preapproval_plan_id]
  if (!plan) return NextResponse.json({ error: 'UNKNOWN_PLAN' }, { status: 422 })

  const { error: updateError } = await supabase
    .from('users')
    .update({ plan, plan_status: 'active', mp_subscription_id: preapprovalId })
    .eq('id', user.id)

  if (updateError) return NextResponse.json({ error: 'DB_ERROR' }, { status: 500 })

  return NextResponse.json({ plan, plan_status: 'active' })
}
