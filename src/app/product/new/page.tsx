import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CalculatorForm } from '@/components/calculator/CalculatorForm'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function NewProductPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  if (user) {
    const [{ data: profile }, { count }] = await Promise.all([
      supabase.from('users').select('plan').eq('id', user.id).single(),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    ])

    if (profile?.plan === 'free' && (count ?? 0) >= 1) {
      redirect('/pricing')
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Nuevo producto</h1>
        {user && (
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">← Dashboard</Button>
          </Link>
        )}
      </div>
      <CalculatorForm />
    </main>
  )
}
