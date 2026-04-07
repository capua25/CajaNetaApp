'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { validatePassword } from '@/lib/validation/password'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL

export function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmEmail, setConfirmEmail] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleGoogleSignIn() {
    if (!acceptedTerms || !acceptedPrivacy) {
      setError('Debés aceptar los Términos y Condiciones y la Política de Privacidad para continuar.')
      return
    }
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${SITE_URL ?? window.location.origin}/auth/callback`,
      },
    })
    if (error) setError('No se pudo iniciar sesión con Google.')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!acceptedTerms || !acceptedPrivacy) {
      setError('Debés aceptar los Términos y Condiciones y la Política de Privacidad para continuar.')
      return
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (!data.session) {
      // Always show the same confirmation screen regardless of whether the
      // email already exists — avoids leaking account existence to attackers.
      setConfirmEmail(true)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  if (confirmEmail) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8 flex flex-col items-center text-center space-y-4">
          <div className="rounded-full bg-green-100 p-4">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-700">¡Registrado con éxito!</h2>
          <p className="text-green-600 text-base">
            Te enviamos un email de confirmación a <span className="font-semibold">{email}</span>.
            Revisá tu bandeja de entrada y hacé click en el enlace para activar tu cuenta.
          </p>
          <Link href="/auth/login" className="w-full mt-2">
            <Button className="w-full">Ir a iniciar sesión</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Crear cuenta</CardTitle>
      </CardHeader>
      <CardContent>
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
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              minLength={8}
              required
            />
          </div>

          {/* Checkboxes de aceptación legal */}
          <div className="space-y-3 pt-1">
            <div className="flex items-start gap-3">
              <input
                id="accept-terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={e => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 accent-primary cursor-pointer"
              />
              <label htmlFor="accept-terms" className="text-sm text-muted-foreground leading-snug cursor-pointer">
                Acepto los{' '}
                <Link
                  href="/legal/terminos"
                  target="_blank"
                  className="underline text-foreground hover:text-foreground/80"
                >
                  Términos y Condiciones
                </Link>
                {' '}y el{' '}
                <Link
                  href="/legal/aviso-legal"
                  target="_blank"
                  className="underline text-foreground hover:text-foreground/80"
                >
                  Aviso Legal
                </Link>
              </label>
            </div>

            <div className="flex items-start gap-3">
              <input
                id="accept-privacy"
                type="checkbox"
                checked={acceptedPrivacy}
                onChange={e => setAcceptedPrivacy(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 accent-primary cursor-pointer"
              />
              <label htmlFor="accept-privacy" className="text-sm text-muted-foreground leading-snug cursor-pointer">
                He leído y acepto la{' '}
                <Link
                  href="/legal/privacidad"
                  target="_blank"
                  className="underline text-foreground hover:text-foreground/80"
                >
                  Política de Privacidad
                </Link>
              </label>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !acceptedTerms || !acceptedPrivacy}
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            ¿Ya tenés cuenta?{' '}
            <Link href="/auth/login" className="underline">
              Iniciar sesión
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
