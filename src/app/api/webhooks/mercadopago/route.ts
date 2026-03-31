import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getPreapproval, validateWebhookSignature } from '@/lib/mercadopago'
import type { Plan } from '@/lib/types'

const PLAN_BY_MP_ID: () => Record<string, Plan> = () => ({
  [process.env.MP_PLAN_ID_PLUS ?? '']: 'plus',
  [process.env.MP_PLAN_ID_PRO ?? '']: 'pro',
})

export async function POST(request: NextRequest) {
  const rawBody = await request.text()

  if (!validateWebhookSignature(request.headers, rawBody)) {
    return NextResponse.json({ error: 'INVALID_SIGNATURE' }, { status: 401 })
  }

  let payload: { type?: string; data?: { id?: string } }
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'INVALID_BODY' }, { status: 400 })
  }

  // Acknowledge and ignore non-subscription events
  if (payload.type !== 'subscription_preapproval') {
    return NextResponse.json({ ok: true })
  }

  const subscriptionId = payload.data?.id
  if (!subscriptionId) {
    return NextResponse.json({ ok: true })
  }

  let preapproval
  try {
    preapproval = await getPreapproval(subscriptionId)
  } catch {
    return NextResponse.json({ error: 'MP_UNREACHABLE' }, { status: 503 })
  }

  const planMap = PLAN_BY_MP_ID()
  const mappedPlan = planMap[preapproval.preapproval_plan_id]

  // Unknown plan ID — log and acknowledge
  if (!mappedPlan && preapproval.status === 'authorized') {
    console.warn('[webhook] Unknown preapproval_plan_id:', preapproval.preapproval_plan_id)
    return NextResponse.json({ ok: true })
  }

  // Determine DB update based on MP status
  type UserUpdate = {
    plan_status: string
    plan?: Plan
    mp_subscription_id?: string
  }

  let update: UserUpdate | null = null
  if (preapproval.status === 'authorized' && mappedPlan) {
    update = { plan: mappedPlan, plan_status: 'active', mp_subscription_id: subscriptionId }
  } else if (preapproval.status === 'cancelled') {
    update = { plan: 'free', plan_status: 'cancelled' }
  } else if (preapproval.status === 'paused') {
    update = { plan_status: 'paused' }
  }

  if (!update) {
    return NextResponse.json({ ok: true })
  }

  const supabase = createServiceClient()

  // Find user by mp_subscription_id first, then fall back to payer_email
  let userId: string | null = null

  const { data: bySubId } = await supabase
    .from('users')
    .select('id')
    .eq('mp_subscription_id', subscriptionId)
    .maybeSingle()

  if (bySubId) {
    userId = bySubId.id
  } else if (preapproval.payer_email) {
    const { data: byEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', preapproval.payer_email)
      .maybeSingle()
    if (byEmail) userId = byEmail.id
  }

  if (!userId) {
    console.warn('[webhook] Could not find user for subscription:', subscriptionId)
    return NextResponse.json({ ok: true })
  }

  const { error: updateError } = await supabase
    .from('users')
    .update(update)
    .eq('id', userId)

  if (updateError) {
    console.error('[webhook] DB update error:', updateError.message)
    return NextResponse.json({ error: 'DB_ERROR' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
