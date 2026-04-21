import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { refreshGlobalUsdToUyuRate } from '@/lib/exchange-rate'

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    console.error('[cron/refresh-exchange-rate] CRON_SECRET is not set')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await refreshGlobalUsdToUyuRate()
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error('[cron/refresh-exchange-rate] failed:', err instanceof Error ? err.message : err)
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'unknown' },
      { status: 502 }
    )
  }
}
