import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://cajaneta.com'),
  title: {
    default: 'Caja Neta — Calculá el precio de tus productos',
    template: '%s | Caja Neta',
  },
  description: 'Calculadora de precios y ganancia para emprendedores. Sabé cuánto cobrar por cada producto, tu margen de ganancia real y el precio de venta ideal. Gratis.',
  openGraph: {
    type: 'website',
    locale: 'es_UY',
    siteName: 'Caja Neta',
    title: 'Caja Neta — Calculá el precio de tus productos',
    description: 'Calculadora de precios y ganancia para emprendedores. Sabé cuánto cobrar por cada producto, tu margen de ganancia real y el precio de venta ideal.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
