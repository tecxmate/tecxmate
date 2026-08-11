import { createHash, timingSafeEqual } from "crypto"
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

export function isAdmin(request: NextRequest): boolean {
  const allow = getAllowlist()
  if (allow.length === 0) return false
  const provided = request.headers.get("x-admin-password")
  if (!provided) return false
  return allow.some((candidate) => matchesPassword(candidate, provided))
}
