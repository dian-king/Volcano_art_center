// Simple in-memory rate limiter — good enough for dev/small scale
// ponytail: replace with Redis-backed limiter (e.g. @upstash/ratelimit) for production

const store = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; remaining: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: limit - 1 }
  }

  entry.count++
  if (entry.count > limit) {
    return { ok: false, remaining: 0 }
  }

  return { ok: true, remaining: limit - entry.count }
}
