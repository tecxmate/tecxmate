import type { NextRequest } from "next/server"

function getAllowlist(): string[] {
  const raw = process.env.ADMIN_PASSWORD ?? ""
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
}

export function isAdmin(request: NextRequest): boolean {
  const allow = getAllowlist()
  if (allow.length === 0) return false
  const provided = request.headers.get("x-admin-password")
  if (!provided) return false
  return allow.includes(provided)
}
