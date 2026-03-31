import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userPlan: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('plan')
      .eq('id', user.id)
      .single()
    userPlan = profile?.plan ?? 'free'
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Planes simples</h1>
        <p className="text-gray-600 text-lg">Empezá gratis, crecé cuando estés listo.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Free */}
        <Card className={userPlan === 'free' ? 'border-2 border-gray-300' : ''}>
          <CardHeader>
            <CardTitle className="text-2xl">Gratis</CardTitle>
            <p className="text-3xl font-bold text-gray-900">$0</p>
            {userPlan === 'free' && (
              <span className="text-sm text-gray-500 font-normal">Tu plan actual</span>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-gray-700">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                1 producto
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                Calculadora completa
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                Precio sugerido
              </li>
            </ul>
            {!user ? (
              <Link href="/auth/register" className="block">
                <Button variant="outline" className="w-full">Empezar gratis</Button>
              </Link>
            ) : (
              <Button variant="outline" className="w-full" disabled>Plan actual</Button>
            )}
          </CardContent>
        </Card>

        {/* Pro */}
        <Card className={`border-2 ${userPlan === 'pro' ? 'border-green-500' : 'border-gray-900'}`}>
          <CardHeader>
            <CardTitle className="text-2xl">Pro</CardTitle>
            <p className="text-3xl font-bold text-gray-900">
              UYU 450
              <span className="text-base font-normal text-gray-500">/mes</span>
            </p>
            {userPlan === 'pro' && (
              <span className="text-sm text-green-600 font-normal">Plan activo</span>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-gray-700">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                Productos ilimitados
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                Simulador de precios
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                Insights automáticos
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                Soporte prioritario
              </li>
            </ul>
            {userPlan === 'pro' ? (
              <Button className="w-full" disabled>Plan activo</Button>
            ) : (
              <Button className="w-full" disabled>
                Próximamente
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
