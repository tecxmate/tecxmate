import { NextRequest, NextResponse } from "next/server"
import { deliverQuote, enforceQuoteRateLimit, quoteSchema } from "@/lib/quote"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const parsed = quoteSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form", fields: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  // Honeypot: a bot filled the hidden field. Accept silently so it does not retry.
  if (parsed.data.website) {
    return NextResponse.json({ ok: true })
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown"

  const rate = await enforceQuoteRateLimit({ ip })
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Too many submissions. Please email us instead." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } },
    )
  }

  const result = await deliverQuote(parsed.data, { receivedAt: new Date().toISOString() })

  // Both destinations failing means the lead is gone — tell them so they can
  // reach us another way rather than assuming it arrived.
  if (!result.email && !result.sheet) {
    return NextResponse.json(
      { error: "We could not record your request. Please contact us directly and we will pick it up." },
      { status: 502 },
    )
  }

  return NextResponse.json({ ok: true, delivered: result })
}
