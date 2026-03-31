'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [confirmEmail, setConfirmEmail] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (!data.session) {
      if (data.user?.identities?.length === 0) {
        setError('Este email ya está registrado. Intentá iniciar sesión.')
      } else {
        setConfirmEmail(true)
      }
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
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
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
