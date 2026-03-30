import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Calculator, DollarSign, Check } from 'lucide-react'

export default function LandingPage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-5xl font-bold text-gray-900 leading-tight">
            Dejá de adivinar<br />tus precios
          </h1>
          <p className="text-xl text-gray-600">
            Calculá tu ganancia real y poné precios correctos en segundos.
            Sin contabilidad compleja, sin dashboards innecesarios.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="text-base px-8">
                Empezar gratis
              </Button>
            </Link>
            <Link href="/product/new">
              <Button size="lg" variant="outline" className="text-base px-8">
                Probar ahora
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-500">Sin tarjeta de crédito · 1 producto gratis para siempre</p>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Te dice la verdad en segundos
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <DollarSign className="h-8 w-8 text-green-500 mb-2" />
                <CardTitle>¿Estás ganando?</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600">
                Calculá tu ganancia real por producto, incluyendo todos tus costos y gastos.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-blue-500 mb-2" />
                <CardTitle>¿Cuánto ganás?</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600">
                Tu margen de ganancia en porcentaje. Sabé exactamente qué tan rentable es cada producto.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Calculator className="h-8 w-8 text-purple-500 mb-2" />
                <CardTitle>¿Qué precio cobrar?</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600">
                Calculamos el precio ideal para alcanzar el margen que querés, sin adivinar.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Planes simples</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Free */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Gratis</CardTitle>
                <p className="text-3xl font-bold">$0</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> 1 producto</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Calculadora completa</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Precio sugerido</li>
                </ul>
                <Link href="/auth/register" className="block mt-4">
                  <Button variant="outline" className="w-full">Empezar gratis</Button>
                </Link>
              </CardContent>
            </Card>
            {/* Pro */}
            <Card className="border-2 border-gray-900">
              <CardHeader>
                <CardTitle className="text-2xl">Pro</CardTitle>
                <p className="text-3xl font-bold">UYU 450<span className="text-base font-normal text-gray-500">/mes</span></p>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Productos ilimitados</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Simulador de precios</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Insights automáticos</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Soporte prioritario</li>
                </ul>
                <Link href="/pricing" className="block mt-4">
                  <Button className="w-full">Ver Pro</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-sm text-gray-500 border-t">
        <p>© 2025 Caja Neta · <Link href="/pricing" className="underline">Precios</Link></p>
      </footer>
    </main>
  )
}
