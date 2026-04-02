export type Plan = 'free' | 'plus' | 'pro'

export type ProductStatus = 'success' | 'warning' | 'danger'

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
  created_at: string
}

export interface FixedCost {
  id: string
  user_id: string
  name: string
  amount: number
  recurrence: Recurrence
  created_at: string
}

export interface ProductWithMix {
  id: string
  name: string
  price: number
  cost: number
  expenses: number
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
}
