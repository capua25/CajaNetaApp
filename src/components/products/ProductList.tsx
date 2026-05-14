import { ProductCard } from './ProductCard'
import type { Product } from '@/lib/types'

interface ProductListProps {
  products: Product[]
  isFreePlan: boolean
  onDetail?: (product: Product) => void
  onEdit?: (product: Product) => void
}

export function ProductList({ products, isFreePlan, onDetail, onEdit }: ProductListProps) {
  const totalProducts = products.length
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} isFreePlan={isFreePlan} totalProducts={totalProducts} onDetail={onDetail} onEdit={onEdit} />
      ))}
    </div>
  )
}
