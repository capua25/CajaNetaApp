import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Iniciar sesión',
  robots: {
    index: false,
    follow: false,
  },
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <LoginForm />
    </main>
  )
}
