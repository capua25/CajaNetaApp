import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? origin
  const type = searchParams.get('type')
  if (type === 'recovery') {
    return NextResponse.redirect(`${siteUrl}/auth/reset-password`)
  }
  return NextResponse.redirect(`${siteUrl}/dashboard`)
}
