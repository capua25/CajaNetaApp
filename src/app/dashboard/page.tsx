import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DashboardProductsSection } from '@/components/dashboard/DashboardProductsSection'
import { PLAN_LIMITS } from '@/lib/plan-config'
import type { UserProfile, Product, Plan } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) redirect('/auth/login')

  const [{ data: profile }, { data: products }] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('products').select('id, name, cost, expenses, price, desired_margin, quantity_sold').eq('user_id', user.id).order('created_at', { ascending: false }),
  ])

  const userProfile = profile as UserProfile | null
  const productList = (products ?? []) as unknown as Product[]
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
        {userProfile?.plan === 'pro' && (
          <Link href="/dashboard/finanzas">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              Finanzas Avanzadas
              <Badge variant="default" className="text-xs">Pro</Badge>
            </Button>
          </Link>
        )}
      </div>

      <DashboardProductsSection
        products={productList}
        isFreePlan={userProfile?.plan === 'free'}
        planStatus={userProfile?.plan_status}
        isFreeLimitReached={isFreeLimitReached}
        plan={plan}
      />
    </main>
  )
}
