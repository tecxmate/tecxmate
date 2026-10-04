import { createHash, timingSafeEqual } from "crypto"
import { Redis } from "@upstash/redis"
import type { NextRequest } from "next/server"

function getAllowlist(): string[] {
  const raw = process.env.ADMIN_PASSWORD ?? ""
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
}

export function isAdminConfigured(): boolean {
  return getAllowlist().length > 0
}

// Hashing to a fixed-length digest before comparing means every candidate is
// checked in constant time, regardless of the provided password's length —
// timingSafeEqual alone would throw on a length mismatch and leak that signal.
function matchesPassword(candidate: string, provided: string): boolean {
  const candidateHash = createHash("sha256").update(candidate).digest()
  const providedHash = createHash("sha256").update(provided).digest()
  return timingSafeEqual(candidateHash, providedHash)
}

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null
  return Redis.fromEnv()
}

function clientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  )
}

const MAX_FAILED_ATTEMPTS = 10
const LOCKOUT_WINDOW_SECONDS = 600 // 10 minutes

function failKey(ip: string): string {
  return `admin:auth-fail:${createHash("sha256").update(ip).digest("hex").slice(0, 32)}`
}

// Counts failed password attempts per IP, not every admin request — the
// dashboard re-sends the password header on every action after login, so
// rate-limiting all traffic would eventually lock out a legitimate admin
// mid-edit. Only wrong guesses count, so normal usage never trips it.
// Fails open (no lockout) if Redis isn't configured or errors, matching the
// rest of the codebase: an outage degrades protection, it doesn't lock out
// the only person who can fix it.
async function isLockedOut(request: NextRequest): Promise<boolean> {
  const redis = getRedis()
  if (!redis) return false
  try {
    const count = (await redis.get<number>(failKey(clientIp(request)))) ?? 0
    return count >= MAX_FAILED_ATTEMPTS
  } catch {
    return false
  }
}

async function recordFailedAttempt(request: NextRequest): Promise<void> {
  const redis = getRedis()
  if (!redis) return
  try {
    const key = failKey(clientIp(request))
    const count = await redis.incr(key)
    if (count === 1) await redis.expire(key, LOCKOUT_WINDOW_SECONDS)
  } catch {
    // best-effort — a failed increment just means this attempt doesn't count
  }
}

export async function isAdmin(request: NextRequest): Promise<boolean> {
  const allow = getAllowlist()
  if (allow.length === 0) return false
  const provided = request.headers.get("x-admin-password")
  if (!provided) return false

  // Denied the same way as a wrong password (plain 401) rather than a
  // distinct "too many attempts" response, so a brute-forcer can't tell
  // lockout from a bad guess and time their next try accordingly.
  if (await isLockedOut(request)) return false

  const matched = allow.some((candidate) => matchesPassword(candidate, provided))
  if (!matched) await recordFailedAttempt(request)
  return matched
}
