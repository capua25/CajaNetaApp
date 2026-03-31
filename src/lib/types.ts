export type Plan = 'free' | 'pro'

export type ProductStatus = 'success' | 'warning' | 'danger'

export interface Product {
  id: string
  user_id: string
  name: string
  cost: number
  expenses: number
  price: number
  desired_margin: number
  created_at: string
}

export interface CalculationResult {
  cost_total: number
  profit: number
  margin: number
  status: ProductStatus
  suggested_price: number
}

export interface UserProfile {
  id: string
  email: string
  plan: Plan
  plan_status: string
}
