/**
 * Sliding-window rate limiter (in-memory).
 *
 * LIMITATION: In serverless environments each instance has its own Map, so
 * this is best-effort mitigation — not a hard guarantee across multiple
 * concurrent instances. For multi-instance guarantee, migrate to
 * @upstash/ratelimit; the interface below is intentionally compatible.
 */

interface WindowEntry {
  count: number
  windowStart: number
}

const store = new Map<string, WindowEntry>()

export function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number }
): { success: boolean; remaining: number } {
  const now = Date.now()

  // Purge expired entries to avoid unbounded memory growth
  for (const [k, entry] of store) {
    if (now - entry.windowStart >= opts.windowMs) {
      store.delete(k)
    }
  }

  const entry = store.get(key)

  if (!entry || now - entry.windowStart >= opts.windowMs) {
    store.set(key, { count: 1, windowStart: now })
    return { success: true, remaining: opts.limit - 1 }
  }

  if (entry.count >= opts.limit) {
    return { success: false, remaining: 0 }
  }

  entry.count++
  return { success: true, remaining: opts.limit - entry.count }
}
