import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { calculate } from '@/lib/calculator'
import { ResultDisplay } from '@/components/calculator/ResultDisplay'
import type { Product } from '@/lib/types'

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !product) notFound()

  const result = calculate(product as Product)

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <ResultDisplay product={product as Product} result={result} />
    </main>
  )
}
