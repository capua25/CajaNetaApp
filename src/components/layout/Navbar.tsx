import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { LogoutButton } from '@/components/layout/LogoutButton'
import { createClient } from '@/lib/supabase/server'

export async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return (
    <nav className="border-b bg-white">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <Image src="/CajaNetaLogo2.svg" alt="Caja Neta" width={120} height={32} priority />
        </Link>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
              <Link href="/dashboard/cuenta">
                <Button variant="ghost" size="sm">Mi cuenta</Button>
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Iniciar sesión</Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Registrarse</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
