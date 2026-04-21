import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { DeleteProductButton } from './DeleteProductButton'
import { calculate } from '@/lib/calculator'
import type { Product } from '@/lib/types'
import { formatCurrency } from '@/lib/currency'

interface ProductCardProps {
  product: Product
  isFreePlan: boolean
  planStatus?: string
  totalProducts?: number
  onDetail?: (product: Product) => void
  onEdit?: (product: Product) => void
}

const formatUYU = (value: number) =>
  new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU', maximumFractionDigits: 0 }).format(value)

export function ProductCard({ product, isFreePlan, planStatus, totalProducts = 1, onDetail, onEdit }: ProductCardProps) {
  const freeOverLimit = isFreePlan && totalProducts > 1
  const canEdit = !freeOverLimit
  const canDelete = !isFreePlan || freeOverLimit
  const result = calculate(product)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{product.name}</h3>
            <p className="text-sm text-gray-500">Precio: {formatUYU(product.price)}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={result.status} />
            {canEdit ? (
              onEdit ? (
                <button onClick={() => onEdit(product)} className="text-gray-400 hover:text-gray-600">
                  <Pencil className="h-4 w-4" />
                </button>
              ) : (
                <Link href={`/product/${product.id}/edit`} className="text-gray-400 hover:text-gray-600">
                  <Pencil className="h-4 w-4" />
                </Link>
              )
            ) : (
              <span
                title="Eliminá productos hasta llegar al límite del plan gratuito para poder editar"
                className="text-gray-200 cursor-not-allowed"
              >
                <Pencil className="h-4 w-4" />
              </span>
            )}
            <DeleteProductButton productId={product.id} disabled={!canDelete} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Ganancia</p>
            <p className="font-semibold text-gray-900">{formatUYU(result.profit)}</p>
          </div>
          <div>
            <p className="text-gray-500">Margen</p>
            <p className="font-semibold text-gray-900">{(result.margin * 100).toFixed(1)}%</p>
          </div>
        </div>
        {onDetail ? (
          <button
            onClick={() => onDetail(product)}
            className="mt-3 block text-sm text-blue-600 hover:underline"
          >
            Ver detalles →
          </button>
        ) : (
          <Link
            href={`/product/${product.id}`}
            className="mt-3 block text-sm text-blue-600 hover:underline"
          >
            Ver detalles →
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
