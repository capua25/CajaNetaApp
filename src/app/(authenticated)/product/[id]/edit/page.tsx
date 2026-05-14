import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CalculatorForm } from '@/components/calculator/CalculatorForm'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  // user is guaranteed by (authenticated) layout — non-null assertion is safe

  const { data: product } = await supabase
    .from('products').select('*').eq('id', id).eq('user_id', user!.id).single()

  if (!product) redirect('/dashboard')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href={`/product/${id}`}>
          <Button variant="outline" size="sm">← Volver</Button>
        </Link>
      </div>
      <h1 className="text-2xl font-bold mb-6">Editar producto</h1>
      <CalculatorForm product={product} />
    </div>
  )
}
