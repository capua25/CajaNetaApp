import { ProductCard } from './ProductCard'
import type { Product, Currency } from '@/lib/types'

interface ProductListProps {
  products: Product[]
  isFreePlan: boolean
  planStatus?: string
  displayCurrency?: Currency
  exchangeRate?: number
  onDetail?: (product: Product) => void
  onEdit?: (product: Product) => void
}

export function ProductList({ products, isFreePlan, planStatus, displayCurrency, exchangeRate, onDetail, onEdit }: ProductListProps) {
  const totalProducts = products.length
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} isFreePlan={isFreePlan} planStatus={planStatus} totalProducts={totalProducts} displayCurrency={displayCurrency} exchangeRate={exchangeRate} onDetail={onDetail} onEdit={onEdit} />
      ))}
    </div>
  )
}
