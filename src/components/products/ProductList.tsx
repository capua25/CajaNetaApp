import { ProductCard } from './ProductCard'
import type { Product } from '@/lib/types'

interface ProductListProps {
  products: Product[]
  isFreePlan: boolean
  planStatus?: string
}

export function ProductList({ products, isFreePlan, planStatus }: ProductListProps) {
  const totalProducts = products.length
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} isFreePlan={isFreePlan} planStatus={planStatus} totalProducts={totalProducts} />
      ))}
    </div>
  )
}
