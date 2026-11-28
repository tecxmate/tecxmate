import { NextRequest, NextResponse } from "next/server"
import { earlyBirdRateLimit, earlyBirdSchema, saveEarlyBird } from "@/lib/voicetecx-early-bird"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  const parsed = earlyBirdSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid", fields: parsed.error.flatten().fieldErrors }, { status: 400 })
  }
  // Honeypot filled: accept silently so a bot does not retry.
  if (parsed.data.website) return NextResponse.json({ ok: true })

  const ip = request.headers.get("cf-connecting-ip")
    || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || "unknown"
  if (!(await earlyBirdRateLimit(ip))) {
    return NextResponse.json({ error: "rate" }, { status: 429, headers: { "Retry-After": "3600" } })
  }

  const result = await saveEarlyBird(parsed.data)
  if (!result.stored && !result.listed && !result.emailed) {
    return NextResponse.json({ error: "unavailable" }, { status: 502 })
  }
  return NextResponse.json({ ok: true })
}
