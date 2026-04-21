'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { BreakEvenChart } from './charts/BreakEvenChart'
import { RevenueProgressChart } from './charts/RevenueProgressChart'
import { SafetyGauge } from './charts/SafetyGauge'
import { MCMixChart } from './charts/MCMixChart'
import type { FinancialSummary, Currency } from '@/lib/types'

export type MetricKey =
  | 'break_even_units'
  | 'break_even_revenue'
  | 'margin_of_safety'
  | 'mc_mix'
  | 'actual_revenue'

const TITLES: Record<MetricKey, string> = {
  break_even_units: 'Punto de equilibrio — unidades por producto',
  break_even_revenue: 'Punto de equilibrio — ingresos por producto',
  margin_of_safety: 'Margen de seguridad',
  mc_mix: 'Margen de contribución por producto',
  actual_revenue: 'Ventas actuales vs. punto de equilibrio',
}

interface MetricChartModalProps {
  summary: FinancialSummary
  metric: MetricKey | null
  onClose: () => void
  currency: Currency
}

export function MetricChartModal({
  summary,
  metric,
  onClose,
  currency,
}: MetricChartModalProps) {
  return (
    <Dialog
      open={metric !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{metric ? TITLES[metric] : ''}</DialogTitle>
        </DialogHeader>

        {metric === 'break_even_units' && (
          <BreakEvenChart
            products={summary.products}
            break_even_units={summary.break_even_units}
            break_even_revenue={summary.break_even_revenue}
            type="units"
            currency={currency}
          />
        )}
        {metric === 'break_even_revenue' && (
          <BreakEvenChart
            products={summary.products}
            break_even_units={summary.break_even_units}
            break_even_revenue={summary.break_even_revenue}
            type="revenue"
            currency={currency}
          />
        )}
        {metric === 'actual_revenue' && (
          <RevenueProgressChart
            actual_revenue={summary.actual_revenue}
            break_even_revenue={summary.break_even_revenue}
            currency={currency}
          />
        )}
        {metric === 'margin_of_safety' && (
          <SafetyGauge margin_of_safety={summary.margin_of_safety} />
        )}
        {metric === 'mc_mix' && (
          <MCMixChart
            products={summary.products}
            mc_mix={summary.mc_mix}
            currency={currency}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
