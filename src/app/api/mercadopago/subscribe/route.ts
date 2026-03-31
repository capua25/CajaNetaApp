import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPreapproval } from '@/lib/mercadopago'
import type { Plan } from '@/lib/types'

const MP_PLAN_ID_KEY: Record<'plus' | 'pro', string> = {
  plus: 'MP_PLAN_ID_PLUS',
  pro: 'MP_PLAN_ID_PRO',
}


export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { plan?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'INVALID_BODY' }, { status: 400 })
  }

  const plan = body.plan
  if (plan !== 'plus' && plan !== 'pro') {
    return NextResponse.json({ error: 'INVALID_PLAN' }, { status: 400 })
  }

  // Check env vars
  if (!process.env.MERCADOPAGO_ACCESS_TOKEN || !process.env[MP_PLAN_ID_KEY[plan]]) {
    return NextResponse.json({ error: 'MP_NOT_CONFIGURED' }, { status: 503 })
  }

  // Check user is not already on this plan
  const { data: profile } = await supabase
    .from('users')
    .select('plan, email')
    .eq('id', user.id)
    .single()

  const userPlan = (profile?.plan ?? 'free') as Plan
  if (userPlan === plan) {
    return NextResponse.json({ error: 'ALREADY_ON_PLAN' }, { status: 409 })
  }

  const userEmail = profile?.email ?? user.email
  if (!userEmail) {
    return NextResponse.json({ error: 'USER_EMAIL_MISSING' }, { status: 400 })
  }

  const planId = process.env[MP_PLAN_ID_KEY[plan]]!
  const backUrl = process.env.MP_BACK_URL ?? 'https://cajanetaapp.com/dashboard/cuenta'

  try {
    const { init_point } = await createPreapproval({
      planId,
      payerEmail: userEmail,
      externalReference: user.id,
      backUrl,
    })
    return NextResponse.json({ init_point })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    if (message === 'MP_NOT_CONFIGURED') {
      return NextResponse.json({ error: 'MP_NOT_CONFIGURED' }, { status: 503 })
    }
    console.error('[subscribe] MP API error:', message)
    return NextResponse.json({ error: 'MP_API_ERROR' }, { status: 502 })
  }
}
