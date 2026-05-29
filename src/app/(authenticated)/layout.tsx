import { redirect } from 'next/navigation'
import { getCachedUser } from '@/lib/supabase/get-user'
import { createClient } from '@/lib/supabase/server'
import { TERMS_VERSION } from '@/lib/legal'
import { NavbarPrivate } from '@/components/layout/NavbarPrivate'

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const user = await getCachedUser()
  if (!user) redirect('/auth/login')

  const supabase = await createClient()
  const { data: publicUser } = await supabase
    .from('users')
    .select('terms_accepted_at, terms_version')
    .eq('id', user.id)
    .single()

  if (
    publicUser?.terms_accepted_at == null ||
    publicUser?.terms_version !== TERMS_VERSION
  ) {
    redirect('/auth/aceptar-terminos')
  }

  return (
    <>
      <NavbarPrivate />
      {children}
    </>
  )
}
