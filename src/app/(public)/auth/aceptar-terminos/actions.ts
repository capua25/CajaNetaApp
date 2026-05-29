'use server'

import { createClient } from '@/lib/supabase/server'
import { getCachedUser } from '@/lib/supabase/get-user'
import { TERMS_VERSION } from '@/lib/legal'

type AceptarTerminosResult =
  | { ok: true }
  | { ok: false; error: string }

export async function aceptarTerminos(): Promise<AceptarTerminosResult> {
  const user = await getCachedUser()
  if (!user) return { ok: false, error: 'No hay sesión activa.' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('users')
    .update({
      terms_accepted_at: new Date().toISOString(),
      terms_version: TERMS_VERSION,
    })
    .eq('id', user.id)

  if (error) {
    console.error('[aceptarTerminos] DB error:', error)
    return { ok: false, error: 'No se pudo registrar la aceptación. Intentá de nuevo.' }
  }

  return { ok: true }
}
