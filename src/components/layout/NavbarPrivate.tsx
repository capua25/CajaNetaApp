import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { LogoutButton } from '@/components/layout/LogoutButton'

export function NavbarPrivate() {
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
          <Link href="/dashboard/cuenta">
            <Button variant="ghost" size="sm">Mi cuenta</Button>
          </Link>
          <LogoutButton />
        </div>
      </div>
    </nav>
  )
}
