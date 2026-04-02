import { Badge } from '@/components/ui/badge'
import type { ProductStatus } from '@/lib/types'

const statusConfig: Record<ProductStatus, { label: string; className: string }> = {
  success: { label: 'Ganando', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
  warning: { label: 'En riesgo', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' },
  critical: { label: 'Margen bajo', className: 'bg-orange-100 text-orange-800 hover:bg-orange-100' },
  danger: { label: 'Perdiendo', className: 'bg-red-100 text-red-800 hover:bg-red-100' },
}

interface StatusBadgeProps {
  status: ProductStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]
  return <Badge className={config.className}>{config.label}</Badge>
}
