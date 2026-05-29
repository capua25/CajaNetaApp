import { calcNetProfit } from '@/lib/finanzas'
import type {
  FinancialSummary,
  Currency,
  Recurrence,
  SnapshotDetail,
} from '@/lib/types'

export interface SnapshotInsert {
  user_id: string
  note: string | null
  display_currency: Currency
  usd_to_uyu_rate: number
  total_fixed_costs_monthly: number
  mc_mix: number | null
  rc_mix: number | null
  break_even_units: number | null
  break_even_revenue: number | null
  margin_of_safety: number | null
  actual_revenue: number
  net_profit: number
  has_quantity_data: boolean
  detail: SnapshotDetail
}

export function buildSnapshotInsert(params: {
  userId: string
  summary: FinancialSummary
  fixedCosts: Array<{
    id: string
    name: string
    amount: number
    recurrence: Recurrence
    currency: Currency
  }>
  displayCurrency: Currency
  usdToUyuRate: number
  note: string | null
}): SnapshotInsert {
  const { userId, summary, fixedCosts, displayCurrency, usdToUyuRate, note } =
    params
  return {
    user_id: userId,
    note,
    display_currency: displayCurrency,
    usd_to_uyu_rate: usdToUyuRate,
    total_fixed_costs_monthly: summary.total_fixed_costs_monthly,
    mc_mix: summary.mc_mix,
    rc_mix: summary.rc_mix,
    break_even_units: summary.break_even_units,
    break_even_revenue: summary.break_even_revenue,
    margin_of_safety: summary.margin_of_safety,
    actual_revenue: summary.actual_revenue,
    net_profit: calcNetProfit(summary.products, summary.total_fixed_costs_monthly),
    has_quantity_data: summary.has_quantity_data,
    detail: {
      products: summary.products,
      fixed_costs: fixedCosts.map((c) => ({
        id: c.id,
        name: c.name,
        amount: c.amount,
        recurrence: c.recurrence,
        currency: c.currency,
      })),
    },
  }
}
