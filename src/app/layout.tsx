import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { createClient } from '@/lib/supabase/server'
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Caja Neta — Calculá tu ganancia real',
  description: 'Calculá tu ganancia real y poné precios correctos en segundos',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="es">
      <body className={inter.className}>
        <Navbar user={user} />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
