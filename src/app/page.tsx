import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Calculator, DollarSign } from 'lucide-react'
import { PLAN_CONFIGS } from '@/lib/plan-config'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Calculadora de Precios para Emprendedores — Caja Neta',
  description: 'Calculá el precio de venta de tus productos en segundos. Conocé tu ganancia real, margen de ganancia y precio sugerido. Herramienta gratuita para emprendedores y pequeños negocios.',
  openGraph: {
    title: 'Calculadora de Precios para Emprendedores',
    description: 'Calculá el precio correcto de tus productos. Ganancia real, margen de ganancia y precio sugerido en segundos. Gratis.',
    url: '/',
  },
  alternates: {
    canonical: '/',
  },
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 flex-shrink-0" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (user) redirect('/dashboard')

  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <p className="text-sm font-medium text-blue-600 uppercase tracking-wide">
            Calculadora de precios para emprendedores
          </p>
          <h1 className="text-5xl font-bold text-gray-900 leading-tight">
            Dejá de adivinar<br />tus precios
          </h1>
          <p className="text-xl text-gray-600">
            Calculá el precio de venta de cada producto, conocé tu ganancia real
            y tu margen de ganancia en segundos. Sin contabilidad compleja.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="text-base px-8">
                Empezar gratis
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-500">Resultados en menos de 30 segundos · Probalo gratis</p>
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
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Planes simples</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {PLAN_CONFIGS.map((plan) => (
              <Card key={plan.key} className={plan.borderClass}>
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.label}</CardTitle>
                  <p className="text-3xl font-bold">
                    {plan.priceDisplay}
                    {plan.priceSuffix && (
                      <span className="text-base font-normal text-gray-500">{plan.priceSuffix}</span>
                    )}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-2 text-gray-600">
                    {plan.summaryFeatures.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <CheckIcon />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.key === 'free' ? '/auth/register' : '/pricing'} className="block mt-4">
                    <Button variant={plan.key === 'free' ? 'outline' : 'default'} className="w-full">
                      {plan.key === 'free' ? 'Empezar gratis' : `Ver ${plan.label}`}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ — SEO */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto space-y-8">
          <h2 className="text-2xl font-bold text-center text-gray-900">Preguntas frecuentes</h2>
          <dl className="space-y-6">
            <div>
              <dt className="font-semibold text-gray-900">¿Cómo calcular el precio de venta de un producto?</dt>
              <dd className="mt-1 text-gray-600 text-sm">Sumá el costo del producto más los gastos adicionales (luz, embalaje, etc.), luego dividí ese total por (1 − margen deseado). Caja Neta hace este cálculo automáticamente y te muestra el precio sugerido en segundos.</dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-900">¿Cómo calcular el margen de ganancia?</dt>
              <dd className="mt-1 text-gray-600 text-sm">El margen de ganancia es la diferencia entre el precio de venta y el costo total, dividida por el precio de venta. Por ejemplo: si vendés a $1.000 y tu costo es $700, tu margen es del 30%. Caja Neta lo calcula por vos.</dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-900">¿Cuánto cobrar por un producto hecho a mano?</dt>
              <dd className="mt-1 text-gray-600 text-sm">Tenés que incluir materia prima, tiempo, gastos fijos proporcionales y el margen que querés ganar. Caja Neta te ayuda a no olvidar ningún costo para que no termines trabajando gratis.</dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-900">¿Es gratis?</dt>
              <dd className="mt-1 text-gray-600 text-sm">Sí. Podés calcular el precio de un producto completamente gratis, sin tarjeta de crédito. Los planes pagos desbloquean múltiples productos y análisis financieros avanzados.</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-sm text-gray-500 border-t">
        <p>© 2025 Caja Neta · <Link href="/pricing" className="underline">Precios</Link></p>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([
          {
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Caja Neta',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            description: 'Calculadora de precios y ganancia para emprendedores. Calculá el precio de venta, margen de ganancia y ganancia real de cada producto.',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'UYU',
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: '¿Cómo calcular el precio de venta de un producto?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Sumá el costo del producto más los gastos adicionales, luego dividí ese total por (1 − margen deseado). Caja Neta hace este cálculo automáticamente y te muestra el precio sugerido en segundos.',
                },
              },
              {
                '@type': 'Question',
                name: '¿Cómo calcular el margen de ganancia?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'El margen de ganancia es la diferencia entre el precio de venta y el costo total, dividida por el precio de venta. Caja Neta lo calcula automáticamente por producto.',
                },
              },
              {
                '@type': 'Question',
                name: '¿Cuánto cobrar por un producto hecho a mano?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Tenés que incluir materia prima, tiempo, gastos fijos proporcionales y el margen que querés ganar. Caja Neta te ayuda a no olvidar ningún costo.',
                },
              },
              {
                '@type': 'Question',
                name: '¿Es gratis?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Sí. Podés calcular el precio de un producto completamente gratis, sin tarjeta de crédito.',
                },
              },
            ],
          },
        ]) }}
      />
    </main>
  )
}
