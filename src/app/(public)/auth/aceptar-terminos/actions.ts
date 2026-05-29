'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCachedUser } from '@/lib/supabase/get-user'
import { TERMS_VERSION } from '@/lib/legal'

type AceptarTerminosResult = { ok: false; error: string }

export async function aceptarTerminos(): Promise<AceptarTerminosResult> {
  const user = await getCachedUser()
  if (!user) return { ok: false, error: 'No hay sesión activa.' }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .update({
      terms_accepted_at: new Date().toISOString(),
      terms_version: TERMS_VERSION,
    })
    .eq('id', user.id)
    .select()

  if (error) {
    console.error('[aceptarTerminos] DB error:', error)
    return { ok: false, error: 'No se pudo registrar la aceptación. Intentá de nuevo.' }
  }

  if (!data || data.length === 0) {
    console.error('[aceptarTerminos] 0 rows affected for user:', user.id)
    return { ok: false, error: 'No se pudo registrar la aceptación. Intentá de nuevo.' }
  }

  // Purga el Client Cache completo para que el gate del layout (authenticated)
  // lea terms_accepted_at fresco en la próxima navegación.
  revalidatePath('/', 'layout')

  redirect('/dashboard')
}
