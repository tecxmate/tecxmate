import "server-only"

import { createHash } from "crypto"
import { Redis } from "@upstash/redis"
import { Resend } from "resend"
import { z } from "zod"
import { company } from "./company"

/**
 * Quote requests: a short qualification form the assistant can hand people to
 * when they would rather fill something in than keep chatting.
 *
 * Every submission goes to two places on purpose — email for immediate
 * awareness, a Google Sheet for the running pipeline. One failing must never
 * lose the lead, so both are attempted and only a total failure is an error.
 */

export const SERVICE_OPTIONS = [
  "ai-agents",
  "apps",
  "modernize",
  "ai-seo",
  "data",
  "ai-integration",
  "not-sure",
] as const

export const BUDGET_OPTIONS = ["under-10k", "10-30k", "30-100k", "over-100k", "not-decided"] as const
export const TIMELINE_OPTIONS = ["asap", "1-3-months", "3-6-months", "exploring"] as const
export const CONTACT_METHODS = ["email", "phone", "line", "whatsapp", "wechat"] as const

export const quoteSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(120),
    company: z.string().trim().max(160).optional().or(z.literal("")),
    email: z.string().trim().email("Enter a valid email").max(200).optional().or(z.literal("")),
    phone: z.string().trim().max(60).optional().or(z.literal("")),
    preferredContact: z.enum(CONTACT_METHODS).default("email"),
    service: z.enum(SERVICE_OPTIONS).default("not-sure"),
    budget: z.enum(BUDGET_OPTIONS).default("not-decided"),
    timeline: z.enum(TIMELINE_OPTIONS).default("exploring"),
    details: z.string().trim().min(1, "Tell us a little about the project").max(4000),
    language: z.enum(["en", "vi", "zh"]).default("en"),
    /** Carried over when the assistant hands the visitor to the form. */
    conversationId: z.string().trim().max(80).optional().or(z.literal("")),
    /**
     * Honeypot. Deliberately permissive: a bot that fills it must pass
     * validation so the route can accept-and-discard silently. Rejecting it
     * here would tell the bot the field matters.
     */
    website: z.string().max(200).optional(),
  })
  .refine((v) => Boolean(v.email) || Boolean(v.phone), {
    message: "Give us either an email or a phone number so we can reply",
    path: ["email"],
  })

export type QuoteRequest = z.infer<typeof quoteSchema>

/** Separate bucket from the chatbot so chatting never blocks submitting. */
export async function enforceQuoteRateLimit(input: {
  ip: string
  limit?: number
}): Promise<{ ok: true } | { ok: false; retryAfterSeconds: number }> {
  const redis = getRedis()
  if (!redis) return { ok: true }
  const limit = input.limit ?? 5
  try {
    const identity = createHash("sha256").update(`quote:${input.ip}`).digest("hex").slice(0, 32)
    const key = `quote:rate:${identity}`
    const count = await redis.incr(key)
    if (count === 1) await redis.expire(key, 3600)
    if (count > limit) return { ok: false, retryAfterSeconds: 3600 }
  } catch (error) {
    console.warn("[quote] rate limit unavailable, allowing through:", error)
  }
  return { ok: true }
}

export type DeliveryResult = { email: boolean; sheet: boolean }

export async function deliverQuote(quote: QuoteRequest, meta: { receivedAt: string }): Promise<DeliveryResult> {
  const [email, sheet] = await Promise.allSettled([
    sendQuoteEmail(quote, meta.receivedAt),
    appendQuoteToSheet(quote, meta.receivedAt),
  ])

  if (email.status === "rejected") console.error("[quote] email delivery failed:", email.reason)
  if (sheet.status === "rejected") console.error("[quote] sheet delivery failed:", sheet.reason)

  return {
    email: email.status === "fulfilled" && email.value,
    sheet: sheet.status === "fulfilled" && sheet.value,
  }
}

function formatQuote(quote: QuoteRequest, receivedAt: string): string {
  return [
    "New quote request from tecxmate.com",
    "",
    `Received:  ${receivedAt}`,
    `Name:      ${quote.name}`,
    `Company:   ${quote.company || "—"}`,
    `Email:     ${quote.email || "—"}`,
    `Phone:     ${quote.phone || "—"}`,
    `Prefers:   ${quote.preferredContact}`,
    `Service:   ${quote.service}`,
    `Budget:    ${quote.budget}`,
    `Timeline:  ${quote.timeline}`,
    `Language:  ${quote.language}`,
    quote.conversationId ? `Chat:      ${quote.conversationId}` : "Chat:      —",
    "",
    "Details:",
    quote.details,
  ].join("\n")
}

async function sendQuoteEmail(quote: QuoteRequest, receivedAt: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return false
  const resend = new Resend(apiKey)
  const to = process.env.QUOTE_NOTIFY_EMAIL || process.env.CHATBOT_TRANSCRIPT_EMAIL || company.contactEmail
  const from = process.env.RESEND_FROM_EMAIL || "Tecxmate Website <onboarding@resend.dev>"
  await resend.emails.send({
    from,
    to,
    subject: `Quote request — ${quote.name}${quote.company ? ` (${quote.company})` : ""}`,
    replyTo: quote.email || undefined,
    text: formatQuote(quote, receivedAt),
  })
  return true
}

/**
 * Appends a row via a Google Apps Script web app bound to the sheet. Chosen
 * over the Sheets API so there is no service account to manage and no extra
 * dependency — the script is a dozen lines and lives in your Google account.
 */
async function appendQuoteToSheet(quote: QuoteRequest, receivedAt: string): Promise<boolean> {
  const url = process.env.QUOTE_SHEET_WEBHOOK_URL
  if (!url) return false

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret: process.env.QUOTE_SHEET_WEBHOOK_SECRET || "",
      receivedAt,
      name: quote.name,
      company: quote.company || "",
      email: quote.email || "",
      phone: quote.phone || "",
      preferredContact: quote.preferredContact,
      service: quote.service,
      budget: quote.budget,
      timeline: quote.timeline,
      language: quote.language,
      conversationId: quote.conversationId || "",
      details: quote.details,
    }),
    signal: AbortSignal.timeout(10_000),
  })

  if (!response.ok) {
    throw new Error(`Sheet webhook returned ${response.status}`)
  }
  return true
}

let redisClient: Redis | null | undefined
function getRedis(): Redis | null {
  if (redisClient !== undefined) return redisClient
  const url = process.env.KV_REST_API_URL
  const token = process.env.KV_REST_API_TOKEN
  redisClient = url && token ? new Redis({ url, token }) : null
  return redisClient
}
