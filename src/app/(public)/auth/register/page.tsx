import type { Metadata } from 'next'
import { RegisterForm } from '@/components/auth/RegisterForm'

export const metadata: Metadata = {
  title: 'Crear cuenta',
  robots: {
    index: false,
    follow: false,
  },
}

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <RegisterForm />
    </main>
  )
}
