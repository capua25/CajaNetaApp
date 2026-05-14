import { redirect } from 'next/navigation'
import { getCachedUser } from '@/lib/supabase/get-user'
import { NavbarPrivate } from '@/components/layout/NavbarPrivate'

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const user = await getCachedUser()
  if (!user) redirect('/auth/login')

  return (
    <>
      <NavbarPrivate />
      {children}
    </>
  )
}
