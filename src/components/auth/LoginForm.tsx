'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { iniciarSesion } from '@/app/(public)/auth/login/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

// FINDING-006: use configured site URL instead of window.location.origin
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL

type View = 'login' | 'forgot'

// FINDING-004: cooldown duration in seconds to prevent email spam
const FORGOT_COOLDOWN_SECONDS = 60

export function LoginForm() {
  const [view, setView] = useState<View>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  // FINDING-004: decrement cooldown every second
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  async function handleGoogleSignIn() {
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // FINDING-006: prefer configured URL, fallback to current origin only as last resort
        redirectTo: `${SITE_URL ?? window.location.origin}/auth/callback`,
      },
    })
    if (error) setError('No se pudo iniciar sesión con Google.')
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await iniciarSesion(email, password)
    // Solo llegamos acá si hubo error: en éxito el action redirige server-side.
    setError(result.error)
    setLoading(false)
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    // Fire and forget — do NOT expose whether the email exists (FINDING-005)
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${SITE_URL ?? window.location.origin}/auth/callback?type=recovery`,
    })

    setLoading(false)
    // FINDING-005: always show success regardless of result to prevent account enumeration
    setForgotSent(true)
    // FINDING-004: start cooldown to prevent email spam
    setCooldown(FORGOT_COOLDOWN_SECONDS)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          {view === 'login' ? 'Iniciar sesión' : 'Recuperar contraseña'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {view === 'login' ? (
          <>
            <Button type="button" variant="outline" className="w-full" onClick={handleGoogleSignIn}>
              <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continuar con Google
            </Button>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">o continuá con email</span>
              </div>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  <button
                    type="button"
                    onClick={() => { setView('forgot'); setError(null) }}
                    className="text-xs text-muted-foreground hover:text-foreground underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Ingresando...' : 'Ingresar'}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                ¿No tenés cuenta?{' '}
                <Link href="/auth/register" className="underline">
                  Registrarse
                </Link>
              </p>
            </form>
          </>
        ) : forgotSent ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              Si existe una cuenta con <span className="font-medium text-foreground">{email}</span>,
              vas a recibir un email con el link para restablecer tu contraseña.
            </p>
            {cooldown > 0 ? (
              <Button variant="outline" className="w-full" disabled>
                Reenviar en {cooldown}s
              </Button>
            ) : (
              <Button variant="outline" className="w-full" onClick={() => setForgotSent(false)}>
                Reenviar email
              </Button>
            )}
            <button
              type="button"
              onClick={() => { setView('login'); setForgotSent(false); setError(null) }}
              className="w-full text-sm text-muted-foreground hover:text-foreground underline"
            >
              Volver al inicio de sesión
            </button>
          </div>
        ) : (
          <form onSubmit={handleForgot} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Ingresá tu email y te enviamos un link para restablecer tu contraseña.
            </p>
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email</Label>
              <Input
                id="forgot-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || cooldown > 0}>
              {loading ? 'Enviando...' : 'Enviar link de recuperación'}
            </Button>
            <button
              type="button"
              onClick={() => { setView('login'); setError(null) }}
              className="w-full text-sm text-muted-foreground hover:text-foreground underline"
            >
              Volver al inicio de sesión
            </button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
