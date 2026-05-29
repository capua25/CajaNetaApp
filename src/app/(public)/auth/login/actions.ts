'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type IniciarSesionResult = { ok: false; error: string }

export async function iniciarSesion(
  email: string,
  password: string,
): Promise<IniciarSesionResult> {
  const supabase = await createClient()

  // Limpia cualquier sesión previa (incluidos chunks huérfanos de una
  // sesión OAuth anterior) antes de autenticar la nueva cuenta.
  await supabase.auth.signOut({ scope: 'local' })

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    return { ok: false, error: 'Email o contraseña incorrectos' }
  }

  // Purga el Client Cache para que el layout (authenticated) resuelva la
  // sesión fresca, y redirige server-side (evita Router Cache stale).
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
