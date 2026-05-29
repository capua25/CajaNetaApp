import type { Currency } from './types'
export type { Currency } from './types'

export const SUPPORTED_CURRENCIES: readonly Currency[] = ['UYU', 'USD'] as const

export function isCurrency(v: unknown): v is Currency {
  return typeof v === 'string' && (SUPPORTED_CURRENCIES as readonly string[]).includes(v)
}

export function formatCurrency(amount: number, currency: Currency): string {
  const safeCurrency: Currency = isCurrency(currency) ? currency : 'UYU'
  const decimals = safeCurrency === 'USD' ? 2 : 0
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: safeCurrency,
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(amount)
}

export function convertAmount(
  amount: number,
  from: Currency,
  to: Currency,
  usdToUyuRate: number
): number {
  if (!Number.isFinite(amount)) return 0
  if (from === to) return amount
  if (!Number.isFinite(usdToUyuRate) || usdToUyuRate <= 0) return amount
  if (from === 'USD' && to === 'UYU') return amount * usdToUyuRate
  if (from === 'UYU' && to === 'USD') return amount / usdToUyuRate
  return amount
}

export function convertProduct<
  T extends { price: number; cost: number; expenses: number; currency: Currency }
>(product: T, displayCurrency: Currency, usdToUyuRate: number): T {
  if (product.currency === displayCurrency) return product
  return {
    ...product,
    price:    convertAmount(product.price,    product.currency, displayCurrency, usdToUyuRate),
    cost:     convertAmount(product.cost,     product.currency, displayCurrency, usdToUyuRate),
    expenses: convertAmount(product.expenses, product.currency, displayCurrency, usdToUyuRate),
    currency: displayCurrency,
  }
}

export function convertFixedCost<
  T extends { amount: number; currency: Currency }
>(cost: T, displayCurrency: Currency, usdToUyuRate: number): T {
  if (cost.currency === displayCurrency) return cost
  return {
    ...cost,
    amount: convertAmount(cost.amount, cost.currency, displayCurrency, usdToUyuRate),
    currency: displayCurrency,
  }
}
