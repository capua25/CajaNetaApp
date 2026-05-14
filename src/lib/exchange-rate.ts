// Server-only — do not import from client components

import { unstable_cache, revalidateTag } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/service'

export const FALLBACK_USD_UYU_RATE = 40.0

export interface ExchangeRateResult {
  rate: number
  source: 'api' | 'manual' | 'stale'
  effectiveDate: string
  stale: boolean
}

const STALE_THRESHOLD_MS = 48 * 60 * 60 * 1000

function isStale(effectiveDateISO: string): boolean {
  const ts = Date.parse(effectiveDateISO)
  if (!Number.isFinite(ts)) return true
  return Date.now() - ts > STALE_THRESHOLD_MS
}

/**
 * Internal (uncached) implementation. Do not export — callers use getUsdToUyuRate.
 * Hierarchy: user override -> global row -> hardcoded fallback 40.0.
 * Never throws. EC7: null/undefined userId returns global row.
 */
async function getUsdToUyuRateUncached(
  userId: string | null | undefined
): Promise<ExchangeRateResult> {
  const supabase = createServiceClient()

  // 1. Try user override (only when we have a real userId)
  if (userId) {
    const { data: userRow } = await supabase
      .from('exchange_rates')
      .select('rate, source, effective_date')
      .eq('from_currency', 'USD')
      .eq('to_currency', 'UYU')
      .eq('user_id', userId)
      .maybeSingle()

    if (userRow) {
      const stale = isStale(userRow.effective_date)
      return {
        rate: userRow.rate,
        source: stale ? 'stale' : (userRow.source as 'api' | 'manual'),
        effectiveDate: userRow.effective_date,
        stale,
      }
    }
  }

  // 2. Try global row (user_id IS NULL)
  const { data: globalRow } = await supabase
    .from('exchange_rates')
    .select('rate, source, effective_date')
    .eq('from_currency', 'USD')
    .eq('to_currency', 'UYU')
    .is('user_id', null)
    .maybeSingle()

  if (globalRow) {
    const stale = isStale(globalRow.effective_date)
    return {
      rate: globalRow.rate,
      source: stale ? 'stale' : (globalRow.source as 'api' | 'manual'),
      effectiveDate: globalRow.effective_date,
      stale,
    }
  }

  // 3. Hardcoded fallback
  return {
    rate: FALLBACK_USD_UYU_RATE,
    source: 'stale',
    effectiveDate: new Date().toISOString().slice(0, 10),
    stale: true,
  }
}

/**
 * Resolve the active USD->UYU rate for a user.
 * Cached with a 1-hour TTL (revalidate: 3600). The userId is part of the
 * cache key so each user gets an independent entry. The tag 'exchange-rate'
 * allows the daily cron to invalidate all entries when the global rate changes.
 */
export const getUsdToUyuRate = unstable_cache(
  getUsdToUyuRateUncached,
  ['exchange-rate'],
  {
    revalidate: 3600,
    tags: ['exchange-rate'],
  }
)

/**
 * Fetch latest USD->UYU rate from open.er-api.com and upsert as the global row.
 * Called by the daily cron. Throws on failure.
 */
export async function refreshGlobalUsdToUyuRate(): Promise<ExchangeRateResult> {
  const response = await fetch('https://open.er-api.com/v6/latest/USD')
  if (!response.ok) {
    throw new Error(`open.er-api.com responded with ${response.status}`)
  }

  const json = await response.json()
  const uyuRate = json?.rates?.UYU
  if (typeof uyuRate !== 'number' || !Number.isFinite(uyuRate) || uyuRate <= 0) {
    throw new Error('Invalid UYU rate in API response')
  }

  const today = new Date().toISOString().slice(0, 10)
  const supabase = createServiceClient()

  // The unique index on exchange_rates is a partial index using COALESCE(user_id, sentinel_uuid)
  // and cannot be referenced by name in Supabase JS .upsert(). Use DELETE + INSERT instead.
  const { error: deleteError } = await supabase
    .from('exchange_rates')
    .delete()
    .eq('from_currency', 'USD')
    .eq('to_currency', 'UYU')
    .is('user_id', null)

  if (deleteError) {
    throw new Error(`Failed to delete global rate row: ${deleteError.message}`)
  }

  const { error: insertError } = await supabase
    .from('exchange_rates')
    .insert({
      user_id: null,
      from_currency: 'USD',
      to_currency: 'UYU',
      rate: uyuRate,
      source: 'api',
      effective_date: today,
    })

  if (insertError) {
    throw new Error(`Failed to insert global rate row: ${insertError.message}`)
  }

  // Invalidate all per-user cache entries so the new global rate propagates
  // immediately instead of waiting for the 1-hour TTL to expire.
  // Second arg 'max' is required by the Next 16 type signature (replaces deprecated 1-arg form).
  revalidateTag('exchange-rate', 'max')

  return {
    rate: uyuRate,
    source: 'api',
    effectiveDate: today,
    stale: false,
  }
}
