import { createHash } from "crypto"
import { Redis } from "@upstash/redis"

let cachedRedis: Redis | null | undefined

// Shared by any route that needs a cheap per-IP throttle. Fails open (no
// Redis configured, or a Redis error) so an outage degrades protection
// rather than taking the endpoint down — same policy as the rest of the
// codebase's rate limiters (lib/chatbot.ts, lib/quote.ts).
function getRedis(): Redis | null {
  if (cachedRedis !== undefined) return cachedRedis
  cachedRedis =
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN ? Redis.fromEnv() : null
  return cachedRedis
}

export async function checkRateLimit(input: {
  scope: string
  identity: string
  limit: number
  windowSeconds: number
}): Promise<{ ok: true } | { ok: false; retryAfterSeconds: number }> {
  const redis = getRedis()
  if (!redis) return { ok: true }
  try {
    const hash = createHash("sha256").update(input.identity).digest("hex").slice(0, 32)
    const key = `ratelimit:${input.scope}:${hash}`
    const count = await redis.incr(key)
    if (count === 1) await redis.expire(key, input.windowSeconds)
    if (count > input.limit) return { ok: false, retryAfterSeconds: input.windowSeconds }
  } catch (error) {
    console.warn(`[rate-limit:${input.scope}] unavailable, allowing through:`, error)
  }
  return { ok: true }
}

export function clientIp(request: Request): string {
  const headers = request.headers
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  )
}
