import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProductList } from '@/components/products/ProductList'
import { NewProductButton } from '@/components/products/NewProductButton'
import { PLAN_LIMITS } from '@/lib/plan-config'
import type { UserProfile, Product, Plan } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: profile }, { data: products }] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('products').select('*').order('created_at', { ascending: false }),
  ])

  const userProfile = profile as UserProfile | null
  const productList = (products ?? []) as Product[]
  const plan = (userProfile?.plan ?? 'free') as Plan
  const limit = PLAN_LIMITS[plan]
  const isFreeLimitReached = limit !== Infinity && productList.length >= limit

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis productos</h1>
          <p className="text-gray-500 text-sm mt-1">{user.email}</p>
        </div>
        <div className="flex items-center gap-3">
          {userProfile?.plan === 'pro' && (
            <Link href="/dashboard/finanzas">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                Finanzas Avanzadas
                <Badge variant="default" className="text-xs">Pro</Badge>
              </Button>
            </Link>
          )}
          <NewProductButton isFreeLimitReached={isFreeLimitReached} plan={plan === 'pro' ? 'free' : plan} />
        </div>
      </div>

      {productList.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg mb-4">Todavía no tenés productos</p>
          <Link href="/product/new">
            <Button>Calcular mi primer producto</Button>
          </Link>
        </div>
      ) : (
        <ProductList products={productList} isFreePlan={userProfile?.plan === 'free'} />
      )}
    </main>
  )
}
