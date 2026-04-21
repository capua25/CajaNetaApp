import type { FixedCost, ProductWithMix, FinancialSummary, Recurrence, Currency } from './types'
import { convertProduct, convertFixedCost } from './currency'

// ---------------------------------------------------------------------------
// Normalisation
// ---------------------------------------------------------------------------

/** Convert a fixed cost amount to its monthly equivalent. */
export function normaliseToMonthly(amount: number, recurrence: Recurrence): number {
  return recurrence === 'annual' ? amount / 12 : amount
}

/** Sum all fixed costs normalised to monthly. */
export function calcTotalFixedCostsMonthly(costs: FixedCost[]): number {
  return costs.reduce((sum, c) => sum + normaliseToMonthly(c.amount, c.recurrence), 0)
}

// ---------------------------------------------------------------------------
// Per-product metrics
// ---------------------------------------------------------------------------

/** Unit contribution margin. mc = price - cv. */
export function calcMC(price: number, cv: number): number {
  return price - cv
}

/** Contribution ratio. rc = mc / price. Returns null if price === 0. */
export function calcRC(mc: number, price: number): number | null {
  if (price === 0) return null
  return mc / price
}

/** Variable cost ratio. rcv = cv / price. Returns null if price === 0. */
export function calcRCV(cv: number, price: number): number | null {
  if (price === 0) return null
  return cv / price
}

// ---------------------------------------------------------------------------
// Mix-level metrics
// ---------------------------------------------------------------------------

/**
 * Build the ProductWithMix array from raw product data.
 * Only products with quantity_sold > 0 contribute to revenue weighting.
 */
export function buildProductMix(
  products: Array<{
    id: string
    name: string
    price: number
    cost: number
    expenses: number
    quantity_sold: number
  }>
): ProductWithMix[] {
  const totalQuantity = products.reduce((sum, p) => sum + p.quantity_sold, 0)

  return products.map((p) => {
    const cv = p.cost + p.expenses
    const rawMc = calcMC(p.price, cv)
    const mc = rawMc <= 0 ? null : rawMc
    const rc = mc !== null ? calcRC(mc, p.price) : null
    const revenue = p.price * p.quantity_sold
    const weight = totalQuantity > 0 ? p.quantity_sold / totalQuantity : 0

    return {
      id: p.id,
      name: p.name,
      price: p.price,
      cost: p.cost,
      expenses: p.expenses,
      cv,
      mc,
      rc,
      quantity_sold: p.quantity_sold,
      revenue,
      weight,
    }
  })
}

/**
 * Weighted contribution margin of the product mix.
 * Only products with quantity_sold > 0 and mc > 0 contribute.
 * Returns null if no qualifying products exist.
 */
export function calcMCMix(products: ProductWithMix[]): number | null {
  const active = products.filter((p) => p.quantity_sold > 0 && p.mc !== null)
  if (active.length === 0) return null

  const totalQuantity = active.reduce((sum, p) => sum + p.quantity_sold, 0)
  if (totalQuantity === 0) return null

  const weightedSum = active.reduce((sum, p) => sum + (p.mc as number) * p.quantity_sold, 0)
  return weightedSum / totalQuantity
}

/**
 * Weighted contribution ratio of the product mix.
 * Returns null if no qualifying products or total revenue is 0.
 */
export function calcRCMix(products: ProductWithMix[]): number | null {
  const active = products.filter((p) => p.quantity_sold > 0 && p.rc !== null)
  if (active.length === 0) return null

  const totalQuantity = active.reduce((sum, p) => sum + p.quantity_sold, 0)
  if (totalQuantity === 0) return null

  const weightedSum = active.reduce((sum, p) => {
    return sum + (p.rc as number) * p.quantity_sold
  }, 0)
  return weightedSum / totalQuantity
}

// ---------------------------------------------------------------------------
// Break-even
// ---------------------------------------------------------------------------

/**
 * Break-even in units. Qe = CF_monthly / mc_mix.
 * Returns null if mcMix is null or <= 0.
 */
export function calcBreakEvenUnits(cf: number, mcMix: number | null): number | null {
  if (cf === 0) return null
  if (mcMix === null || mcMix <= 0) return null
  return cf / mcMix
}

/**
 * Break-even in monetary value. Ve = CF_monthly / rc_mix.
 * Returns null if rcMix is null or <= 0.
 */
export function calcBreakEvenRevenue(cf: number, rcMix: number | null): number | null {
  if (cf === 0) return null
  if (rcMix === null || rcMix <= 0) return null
  return cf / rcMix
}

// ---------------------------------------------------------------------------
// Safety margin
// ---------------------------------------------------------------------------

/**
 * Margin of safety as a decimal. MS = (V_actual - Ve) / V_actual.
 * Returns null if breakEvenRevenue is null or actualRevenue === 0.
 */
export function calcMarginOfSafety(
  actualRevenue: number,
  breakEvenRevenue: number | null
): number | null {
  if (breakEvenRevenue === null || actualRevenue === 0) return null
  return (actualRevenue - breakEvenRevenue) / actualRevenue
}

// ---------------------------------------------------------------------------
// Master builder
// ---------------------------------------------------------------------------

/**
 * Orchestrates all calculations and returns a FinancialSummary.
 * Single entry point for API routes and pages.
 */
export function buildFinancialSummary(
  products: Array<{
    id: string
    name: string
    price: number
    cost: number
    expenses: number
    quantity_sold: number
  }>,
  fixedCosts: FixedCost[]
): FinancialSummary {
  const productMix = buildProductMix(products)

  const total_fixed_costs_monthly = calcTotalFixedCostsMonthly(fixedCosts)
  const mc_mix = calcMCMix(productMix)
  const rc_mix = calcRCMix(productMix)
  const break_even_units = calcBreakEvenUnits(total_fixed_costs_monthly, mc_mix)
  const break_even_revenue = calcBreakEvenRevenue(total_fixed_costs_monthly, rc_mix)
  const actual_revenue = productMix.reduce((sum, p) => sum + p.revenue, 0)
  const margin_of_safety = calcMarginOfSafety(actual_revenue, break_even_revenue)
  const has_quantity_data = products.some((p) => p.quantity_sold > 0)

  return {
    total_fixed_costs_monthly,
    mc_mix,
    rc_mix,
    break_even_units,
    break_even_revenue,
    margin_of_safety,
    actual_revenue,
    products: productMix,
    has_quantity_data,
  }
}
