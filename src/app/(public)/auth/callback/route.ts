import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL

export async function GET(request: Request) {
  if (!SITE_URL) {
    // Fail closed: never redirect to an unknown origin
    return new NextResponse('Server misconfigured: NEXT_PUBLIC_SITE_URL is not set', { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      return NextResponse.redirect(`${SITE_URL}/auth/login?error=invalid_code`)
    }
  }

  const type = searchParams.get('type')
  if (type === 'recovery') {
    return NextResponse.redirect(`${SITE_URL}/auth/reset-password`)
  }
  return NextResponse.redirect(`${SITE_URL}/dashboard`)
}
