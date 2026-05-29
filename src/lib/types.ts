export type Plan = 'free' | 'plus' | 'pro'

export type Currency = 'UYU' | 'USD'

export type ProductStatus = 'success' | 'warning' | 'critical' | 'danger'

export type Recurrence = 'monthly' | 'annual'

export interface Product {
  id: string
  user_id: string
  name: string
  cost: number
  expenses: number
  price: number
  desired_margin: number
  quantity_sold: number
  currency: Currency
  created_at: string
}

export interface FixedCost {
  id: string
  user_id: string
  name: string
  amount: number
  recurrence: Recurrence
  currency: Currency
  created_at: string
}

export interface ProductWithMix {
  id: string
  name: string
  price: number
  cost: number
  expenses: number
  currency: Currency
  cv: number          // cost + expenses
  mc: number | null   // price - cv (null if mc <= 0)
  rc: number | null   // mc / price (null if price === 0)
  quantity_sold: number
  revenue: number     // price * quantity_sold
  weight: number      // revenue / total_revenue (0 if no revenue)
}

export interface FinancialSummary {
  total_fixed_costs_monthly: number   // normalised CF
  mc_mix: number | null               // weighted avg mc (null if no qty data)
  rc_mix: number | null               // weighted avg rc
  break_even_units: number | null     // CF / mc_mix
  break_even_revenue: number | null   // CF / rc_mix
  margin_of_safety: number | null     // (actual_revenue - Ve) / actual_revenue
  actual_revenue: number              // sum of p*Q across products
  products: ProductWithMix[]
  has_quantity_data: boolean          // false if all quantity_sold === 0
}

export interface CalculationResult {
  cost_total: number
  profit: number
  margin: number
  status: ProductStatus
  suggested_price: number
  monthly_profit: number
}

export interface UserProfile {
  id: string
  email: string
  plan: Plan
  plan_status: string
  mp_subscription_id: string | null
  plan_expires_at: string | null
  display_currency: Currency
}

export interface ExchangeRate {
  id: string
  user_id: string | null
  from_currency: Currency
  to_currency: Currency
  rate: number
  source: 'api' | 'manual'
  effective_date: string
  created_at: string
  updated_at: string
}

export interface SnapshotFixedCostDetail {
  id: string
  name: string
  amount: number
  recurrence: Recurrence
  currency: Currency
}

export interface SnapshotDetail {
  products: ProductWithMix[]
  fixed_costs: SnapshotFixedCostDetail[]
}

export interface FinanzasSnapshot {
  id: string
  user_id: string
  created_at: string
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
