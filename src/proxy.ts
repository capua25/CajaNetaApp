import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)

  const { pathname } = request.nextUrl

  const PROTECTED_PREFIXES = ['/dashboard', '/product']
  const authPaths = ['/auth/login', '/auth/register']
  const REDIRECT_IF_AUTH = ['/']

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  )
  const isAuthPath = authPaths.some((p) => pathname.startsWith(p))
  const isAuthRedirectTarget = REDIRECT_IF_AUTH.includes(pathname)

  if (isProtected && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/auth/login'
    return NextResponse.redirect(redirectUrl)
  }

  if ((isAuthPath || isAuthRedirectTarget) && user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/|pricing|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
