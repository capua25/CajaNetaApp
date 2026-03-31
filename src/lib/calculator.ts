import type { CalculationResult, Product, ProductStatus } from './types'

export function calcCostTotal(cost: number, expenses: number): number {
  return cost + expenses
}

export function calcProfit(price: number, costTotal: number): number {
  return price - costTotal
}

export function calcMargin(profit: number, price: number): number {
  if (price === 0) return 0
  return profit / price
}

export function calcSuggestedPrice(costTotal: number, desiredMargin: number): number {
  if (desiredMargin >= 1) return costTotal
  return costTotal / (1 - desiredMargin)
}

export function calcStatus(margin: number): ProductStatus {
  if (margin >= 0.3) return 'success'
  if (margin >= 0.1) return 'warning'
  return 'danger'
}

export function calculate(
  product: Pick<Product, 'cost' | 'expenses' | 'price' | 'desired_margin'>
): CalculationResult {
  const cost_total = calcCostTotal(product.cost, product.expenses)
  const profit = calcProfit(product.price, cost_total)
  const margin = calcMargin(profit, product.price)
  const status = calcStatus(margin)
  const suggested_price = calcSuggestedPrice(cost_total, product.desired_margin)

  return { cost_total, profit, margin, status, suggested_price }
}
