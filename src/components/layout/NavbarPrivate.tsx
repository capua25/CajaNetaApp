import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { LogoutButton } from '@/components/layout/LogoutButton'
import { createClient } from '@/lib/supabase/server'
import { getCachedUser } from '@/lib/supabase/get-user'
import type { Plan } from '@/lib/types'

export async function NavbarPrivate() {
  const user = await getCachedUser()
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('users')
    .select('plan')
    .eq('id', user!.id)
    .single()
  const plan = (profile?.plan ?? 'free') as Plan

  return (
    <nav className="border-b bg-white">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <Image src="/CajaNetaLogo2.svg" alt="Caja Neta" width={120} height={32} priority />
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">Dashboard</Button>
          </Link>
          {plan === 'pro' && (
            <Link href="/dashboard/finanzas">
              <Button variant="ghost" size="sm">Finanzas</Button>
            </Link>
          )}
          <Link href="/dashboard/cuenta">
            <Button variant="ghost" size="sm">Mi cuenta</Button>
          </Link>
          <LogoutButton />
        </div>
      </div>
    </nav>
  )
}
