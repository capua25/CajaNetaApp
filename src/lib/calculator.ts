import type { CalculationResult, Product, ProductStatus } from './types'

export function getStatusMessage(result: CalculationResult): string {
  if (result.margin < 0) return 'Estás vendiendo por debajo del costo.'
  if (result.monthly_profit === 0) return 'Sin ventas registradas. El margen no refleja impacto real.'
  if (result.status === 'success') return 'Estás cumpliendo tu objetivo de margen.'
  if (result.status === 'warning') return 'Rentable, pero por debajo de tu objetivo de margen.'
  if (result.status === 'critical') return 'Ganás, pero el margen está muy alejado de tu objetivo.'
  return 'Margen muy alejado de tu objetivo.'
}

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

export function calcStatus(
  margin: number,
  desiredMargin: number,
  quantitySold: number
): ProductStatus {
  if (margin < 0) return 'danger'
  if (quantitySold === 0) return 'warning'
  if (margin >= desiredMargin) return 'success'
  if (margin >= desiredMargin * 0.7) return 'warning'
  return 'critical'
}

export function calculate(
  product: Pick<Product, 'cost' | 'expenses' | 'price' | 'desired_margin' | 'quantity_sold'>
): CalculationResult {
  const cost_total = calcCostTotal(product.cost, product.expenses)
  const profit = calcProfit(product.price, cost_total)
  const margin = calcMargin(profit, product.price)
  const status = calcStatus(margin, product.desired_margin, product.quantity_sold)
  const suggested_price = calcSuggestedPrice(cost_total, product.desired_margin)
  const monthly_profit = profit * product.quantity_sold

  return { cost_total, profit, margin, status, suggested_price, monthly_profit }
}
