import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCachedUser } from '@/lib/supabase/get-user'
import { Button } from '@/components/ui/button'
import { SnapshotHistory } from '@/components/finanzas/SnapshotHistory'
import type { FinanzasSnapshot, UserProfile } from '@/lib/types'

export default async function HistorialPage() {
  const user = await getCachedUser()
  const userId = user!.id

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('users')
    .select('plan')
    .eq('id', userId)
    .single()

  const userProfile = profile as Pick<UserProfile, 'plan'> | null
  if (userProfile?.plan !== 'pro') redirect('/pricing')

  // Rango por defecto: últimos 30 días
  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(now.getDate() - 30)

  const defaultFrom = thirtyDaysAgo.toISOString().slice(0, 10)
  const defaultTo = now.toISOString().slice(0, 10)

  const { data: snapshots } = await supabase
    .from('finanzas_snapshots')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: false })

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Histórico de Finanzas
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Registro de tus snapshots guardados
          </p>
        </div>
        <Link href="/dashboard/finanzas">
          <Button variant="outline" size="sm">
            Volver a finanzas
          </Button>
        </Link>
      </div>

      <SnapshotHistory
        initialSnapshots={(snapshots ?? []) as FinanzasSnapshot[]}
        defaultFrom={defaultFrom}
        defaultTo={defaultTo}
      />
    </main>
  )
}
