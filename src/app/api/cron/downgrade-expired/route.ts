import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = request.headers.get('authorization')
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const supabase = createServiceClient()

  const { data: expired, error } = await supabase
    .from('users')
    .select('id')
    .eq('plan_status', 'cancelled')
    .neq('plan', 'free')
    .lte('plan_expires_at', new Date().toISOString())

  if (error) {
    console.error('[cron/downgrade-expired] DB select error:', error.message)
    return NextResponse.json({ error: 'DB_ERROR' }, { status: 500 })
  }

  if (!expired || expired.length === 0) {
    return NextResponse.json({ ok: true, downgraded: 0 })
  }

  const ids = expired.map(u => u.id)

  const { error: updateError } = await supabase
    .from('users')
    .update({ plan: 'free', plan_expires_at: null })
    .in('id', ids)

  if (updateError) {
    console.error('[cron/downgrade-expired] DB update error:', updateError.message)
    return NextResponse.json({ error: 'DB_ERROR' }, { status: 500 })
  }

  console.log(`[cron/downgrade-expired] Downgraded ${ids.length} user(s):`, ids)
  return NextResponse.json({ ok: true, downgraded: ids.length })
}
