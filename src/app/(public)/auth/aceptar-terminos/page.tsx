import { redirect } from 'next/navigation'
import { getCachedUser } from '@/lib/supabase/get-user'
import { createClient } from '@/lib/supabase/server'
import { TERMS_VERSION } from '@/lib/legal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AcceptTermsForm } from './AcceptTermsForm'

export default async function AceptarTerminosPage() {
  const user = await getCachedUser()
  if (!user) redirect('/auth/login')

  const supabase = await createClient()
  const { data: publicUser } = await supabase
    .from('users')
    .select('terms_accepted_at, terms_version')
    .eq('id', user.id)
    .single()

  if (
    publicUser?.terms_accepted_at != null &&
    publicUser?.terms_version === TERMS_VERSION
  ) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Antes de continuar</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Actualizamos nuestros documentos legales. Para seguir usando CajaNetaApp
            necesitás aceptarlos.
          </p>
          <AcceptTermsForm />
        </CardContent>
      </Card>
    </main>
  )
}
