import "server-only"

import { createHash } from "crypto"
import { Redis } from "@upstash/redis"
import { Resend } from "resend"
import { z } from "zod"
import { company } from "./company"
import { putStored, readStoredJSON, storageConfigured } from "./storage"

/**
 * The VoiceTecx early-bird list (Niko, 2026-11-29: a real sign-up list, not the general quote form).
 *
 * One record per email address, so signing up twice updates the record instead of adding a second one:
 * - R2 / Blob: signups/voicetecx-early-bird/<hash of the email>.json (the list that is kept);
 * - Redis, when configured: hash "voicetecx:early-bird", field = email (easy to read back as one list);
 * - an email to the team, so each sign-up is seen the day it arrives.
 * A sign-up counts as received when at least one of these works.
 */

export const USE_OPTIONS = ["legal", "clinic", "business", "writing", "study", "other"] as const
export const MAC_OPTIONS = ["apple-silicon", "intel", "no-mac", "not-sure"] as const

export const earlyBirdSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  name: z.string().trim().max(120).optional().or(z.literal("")),
  use: z.enum(USE_OPTIONS).optional(),
  mac: z.enum(MAC_OPTIONS).optional(),
  language: z.enum(["en", "zh"]).default("zh"),
  /** Required: the person agrees to receive the early-bird offer and release news by email. */
  consent: z.literal(true),
  /** Honeypot; a bot that fills it is accepted and discarded. */
  website: z.string().max(200).optional(),
})

export type EarlyBird = z.infer<typeof earlyBirdSchema>

const LIST_KEY = "voicetecx:early-bird"

let redisClient: Redis | null | undefined
function getRedis(): Redis | null {
  if (redisClient !== undefined) return redisClient
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
  redisClient = url && token ? new Redis({ url, token }) : null
  return redisClient
}

/** Its own bucket, so the quote form and the sign-up never block each other. */
export async function earlyBirdRateLimit(ip: string): Promise<boolean> {
  const redis = getRedis()
  if (!redis) return true
  try {
    const key = `voicetecx:early-bird:rate:${createHash("sha256").update(ip).digest("hex").slice(0, 32)}`
    const count = await redis.incr(key)
    if (count === 1) await redis.expire(key, 3600)
    return count <= 10
  } catch {
    return true
  }
}

export async function saveEarlyBird(entry: EarlyBird): Promise<{ stored: boolean; listed: boolean; emailed: boolean }> {
  const id = createHash("sha256").update(entry.email).digest("hex").slice(0, 32)
  const path = `signups/voicetecx-early-bird/${id}.json`
  // Signing up again keeps earlier answers that this time were left blank, and the first sign-up date.
  type Rec = { name: string; use: string; mac: string; signedUpAt: string }
  const before = await readStoredJSON<Rec>(path)
  const now = new Date().toISOString()
  const record = {
    email: entry.email,
    name: entry.name || before?.name || "",
    use: entry.use ?? before?.use ?? "",
    mac: entry.mac ?? before?.mac ?? "",
    language: entry.language,
    consent: true,
    signedUpAt: before?.signedUpAt || now,
    updatedAt: now,
  }

  const [stored, listed, emailed] = await Promise.allSettled([
    (async () => {
      if (!storageConfigured()) return false
      await putStored(path, JSON.stringify(record), "application/json")
      return true
    })(),
    (async () => {
      const redis = getRedis()
      if (!redis) return false
      await redis.hset(LIST_KEY, { [entry.email]: JSON.stringify(record) })
      return true
    })(),
    notifyTeam(record),
  ])
  // Never log the address itself.
  for (const [what, r] of [["storage", stored], ["redis", listed], ["email", emailed]] as const) {
    if (r.status === "rejected") console.error(`[early-bird] ${what} failed:`, r.reason)
  }
  const ok = (r: PromiseSettledResult<boolean>) => r.status === "fulfilled" && r.value
  return { stored: ok(stored), listed: ok(listed), emailed: ok(emailed) }
}

async function notifyTeam(record: Record<string, unknown>): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return false
  const resend = new Resend(apiKey)
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "Tecxmate Website <onboarding@resend.dev>",
    to: process.env.VOICETECX_SIGNUP_EMAIL || process.env.QUOTE_NOTIFY_EMAIL || company.contactEmail,
    subject: "VoiceTecx early-bird sign-up",
    text: [
      "New VoiceTecx early-bird sign-up from tecxmate.com",
      "",
      ...Object.entries(record).map(([k, v]) => `${k.padEnd(10)} ${String(v) || "—"}`),
    ].join("\n"),
  })
  if (error) throw new Error(`Resend: ${error.name} — ${error.message}`)
  return true
}
