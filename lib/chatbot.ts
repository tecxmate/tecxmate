import "server-only"

import { createHash } from "crypto"
import { readFile } from "fs/promises"
import { join } from "path"
import { Redis } from "@upstash/redis"
import { Resend } from "resend"
import type { ChatbotConfig, Locale, Localized, SiteContent } from "./site-content"
import { company } from "./company"

export type PublicChatbotConfig = Pick<
  ChatbotConfig,
  "enabled" | "title" | "subtitle" | "greeting" | "placeholder" | "quickQuestions" | "escalation" | "limits"
>

export type StoredChatMessage = {
  role: "user" | "assistant" | "system"
  text: string
  createdAt: string
}

export type ChatSessionRecord = {
  id: string
  visitorId: string
  language: Locale
  createdAt: string
  updatedAt: string
  escalatedAt?: string
  contactHint?: string
  messages: StoredChatMessage[]
}

export type VisitorMemory = {
  visitorId: string
  summary: string
  updatedAt: string
}

export function publicChatbotConfig(config: ChatbotConfig): PublicChatbotConfig {
  return {
    enabled: config.enabled,
    title: config.title,
    subtitle: config.subtitle,
    greeting: config.greeting,
    placeholder: config.placeholder,
    quickQuestions: config.quickQuestions,
    escalation: config.escalation,
    limits: config.limits,
  }
}

export function localized(value: Localized | undefined, locale: string | undefined, fallback = ""): string {
  if (!value) return fallback
  const key = locale === "vi" || locale === "zh" ? locale : "en"
  return value[key] || value.en || fallback
}

export function buildChatbotKnowledge(content: SiteContent, locale: Locale): string {
  const co = content.company
  const services = content.services.items
    .map((service) => `- ${localized(service.title, locale)}: ${localized(service.description, locale)}`)
    .join("\n")
  const contact = [
    `Email: ${co.contactEmail}`,
    `LINE: ${content.chatbot.escalation.lineUrl}`,
    `Booking: ${co.social.booking}`,
    `Phone Taiwan: ${co.phone.tw.display}`,
    `Phone Vietnam: ${co.phone.vn.display}`,
    `Phone US: ${co.phone.us.display}`,
  ].join("\n")

  return [
    `Brand: ${co.name}`,
    `Legal name: ${co.legalName.en} / ${co.legalName.vi}`,
    `Markets: ${co.operatingMarkets.join(", ")}`,
    `Address: ${localized(co.addressDisplay, locale)}`,
    "",
    "Website positioning:",
    localized(content.hero.title, locale),
    localized(content.hero.subtitle, locale),
    "",
    "Editable chatbot knowledge:",
    localized(content.chatbot.knowledge, locale),
    "",
    "Services:",
    services,
    "",
    "Contact points:",
    contact,
  ].join("\n")
}

/**
 * ASSISTANT.md at the repo root is the human-editable brief for the assistant.
 * Cached for a minute so editing it shows up quickly in dev without re-reading
 * from disk on every message. Missing file is not an error — the assistant just
 * falls back to the site-content knowledge.
 */
let assistantBriefCache: { text: string; readAt: number } | null = null
const ASSISTANT_BRIEF_TTL_MS = 60_000

export async function loadAssistantBrief(): Promise<string> {
  const now = Date.now()
  if (assistantBriefCache && now - assistantBriefCache.readAt < ASSISTANT_BRIEF_TTL_MS) {
    return assistantBriefCache.text
  }
  let text = ""
  try {
    text = (await readFile(join(process.cwd(), "ASSISTANT.md"), "utf8")).trim()
  } catch (error) {
    console.warn("[chatbot] ASSISTANT.md not readable, continuing without it:", error)
  }
  assistantBriefCache = { text, readAt: now }
  return text
}

export async function buildSystemPrompt(input: {
  content: SiteContent
  locale: Locale
  memory?: VisitorMemory | null
}): Promise<string> {
  const { content, locale, memory } = input
  const brief = await loadAssistantBrief()
  return [
    localized(content.chatbot.systemPrompt, locale),
    "",
    "Escalation behavior:",
    localized(content.chatbot.escalation.message, locale),
    "If escalation is useful, tell the customer the best contact point and give them the link. Do not ask for contact details unless the customer volunteers them or asks for follow-up.",
    "",
    memory?.summary ? `Known returning-visitor memory:\n${memory.summary}` : "Known returning-visitor memory: none.",
    "",
    "Tecxmate knowledge:",
    buildChatbotKnowledge(content, locale),
    ...(brief
      ? [
          "",
          "Authoritative Tecxmate brief (ASSISTANT.md). Where this conflicts with anything above, this wins:",
          brief,
        ]
      : []),
  ].join("\n")
}

export function normalizeLocale(value: unknown): Locale {
  return value === "vi" || value === "zh" ? value : "en"
}

export function extractContactHint(text: string): string | undefined {
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0]
  const phone = text.match(/(?:\+?\d[\d\s().-]{7,}\d)/)?.[0]
  return [email, phone].filter(Boolean).join(" / ") || undefined
}

export function isHumanEscalationRequest(text: string): boolean {
  const normalized = text.toLowerCase()
  return [
    "human",
    "real person",
    "talk to someone",
    "call me",
    "contact me",
    "quote",
    "proposal",
    "line",
    "zalo",
    "email me",
    "người thật",
    "liên hệ",
    "báo giá",
    "真人",
    "聯絡",
    "報價",
    "提案",
  ].some((term) => normalized.includes(term))
}

export function textFromUIMessage(message: { parts?: Array<{ type: string; text?: string }> }): string {
  return message.parts
    ?.filter((part) => part.type === "text" && typeof part.text === "string")
    .map((part) => part.text)
    .join("")
    .trim() ?? ""
}

export function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null
  return Redis.fromEnv()
}

export async function enforceChatRateLimit(input: {
  sessionId: string
  ip: string
  limit: number
}): Promise<{ ok: true } | { ok: false; retryAfterSeconds: number }> {
  const redis = getRedis()
  if (!redis) return { ok: true }
  try {
    const identity = createHash("sha256").update(`${input.ip}:${input.sessionId}`).digest("hex").slice(0, 32)
    const key = `chatbot:rate:${identity}`
    const count = await redis.incr(key)
    if (count === 1) await redis.expire(key, 3600)
    if (count > input.limit) return { ok: false, retryAfterSeconds: 3600 }
  } catch (error) {
    logOptionalIntegrationError("chatbot rate limit", error)
  }
  return { ok: true }
}

/**
 * Answer budget: a visitor gets 10 credits per rolling 24h. A short answer
 * costs 1, a long one 2 — so roughly 10 short answers or 5 long ones. Credits
 * are charged after the reply is generated (we cannot know its length before),
 * so the budget stops the *next* message once it is spent.
 *
 * Without Redis there is no budget — the site stays usable rather than
 * refusing everyone when the store is down.
 */
export const ANSWER_BUDGET = 10
export const LONG_ANSWER_CHARS = 700
const BUDGET_WINDOW_SECONDS = 86_400

export function answerCost(text: string): number {
  return text.trim().length >= LONG_ANSWER_CHARS ? 2 : 1
}

function budgetKey(visitorId: string) {
  return `chatbot:budget:${createHash("sha256").update(visitorId).digest("hex").slice(0, 32)}`
}

export async function getAnswerBudget(visitorId: string): Promise<{ spent: number; remaining: number }> {
  const redis = getRedis()
  if (!redis || !visitorId) return { spent: 0, remaining: ANSWER_BUDGET }
  try {
    const spent = (await redis.get<number>(budgetKey(visitorId))) ?? 0
    return { spent, remaining: Math.max(0, ANSWER_BUDGET - spent) }
  } catch (error) {
    logOptionalIntegrationError("chatbot budget read", error)
    return { spent: 0, remaining: ANSWER_BUDGET }
  }
}

export async function chargeAnswerBudget(visitorId: string, cost: number): Promise<void> {
  const redis = getRedis()
  if (!redis || !visitorId || cost <= 0) return
  try {
    const key = budgetKey(visitorId)
    const total = await redis.incrby(key, cost)
    if (total === cost) await redis.expire(key, BUDGET_WINDOW_SECONDS)
  } catch (error) {
    logOptionalIntegrationError("chatbot budget charge", error)
  }
}

export async function loadVisitorMemory(visitorId: string): Promise<VisitorMemory | null> {
  const redis = getRedis()
  if (!redis || !visitorId) return null
  try {
    return (await redis.get<VisitorMemory>(`chatbot:visitor:${visitorId}:memory`)) ?? null
  } catch (error) {
    logOptionalIntegrationError("chatbot memory load", error)
    return null
  }
}

export async function saveVisitorMemory(input: {
  visitorId: string
  summary: string
  retainDays: number
}) {
  const redis = getRedis()
  if (!redis || !input.visitorId || !input.summary.trim()) return
  try {
    const ttl = input.retainDays * 24 * 60 * 60
    const memory: VisitorMemory = {
      visitorId: input.visitorId,
      summary: input.summary.trim().slice(0, 1800),
      updatedAt: new Date().toISOString(),
    }
    await redis.set(`chatbot:visitor:${input.visitorId}:memory`, memory, { ex: ttl })
  } catch (error) {
    logOptionalIntegrationError("chatbot memory save", error)
  }
}

export async function appendChatMessages(input: {
  sessionId: string
  visitorId: string
  language: Locale
  retainDays: number
  messages: StoredChatMessage[]
  contactHint?: string
  escalated?: boolean
}) {
  const redis = getRedis()
  if (!redis || !input.sessionId) return
  try {
    const key = `chatbot:session:${input.sessionId}`
    const existing = (await redis.get<ChatSessionRecord>(key)) ?? null
    const now = new Date().toISOString()
    const next: ChatSessionRecord = {
      id: input.sessionId,
      visitorId: input.visitorId,
      language: input.language,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      escalatedAt: existing?.escalatedAt ?? (input.escalated ? now : undefined),
      contactHint: input.contactHint ?? existing?.contactHint,
      messages: [...(existing?.messages ?? []), ...input.messages].slice(-60),
    }
    const ttl = input.retainDays * 24 * 60 * 60
    await redis.set(key, next, { ex: ttl })
  } catch (error) {
    logOptionalIntegrationError("chatbot transcript save", error)
  }
}

export async function notifyHuman(input: {
  content: SiteContent
  sessionId: string
  visitorId: string
  language: Locale
  reason: string
  contactHint?: string
  messages: StoredChatMessage[]
}) {
  const transcript = formatTranscript(input.messages)
  const text = [
    "Tecxmate chatbot escalation",
    `Reason: ${input.reason || "Customer requested support"}`,
    `Session: ${input.sessionId}`,
    `Visitor: ${input.visitorId}`,
    `Language: ${input.language}`,
    input.contactHint ? `Contact: ${input.contactHint}` : "Contact: not volunteered",
    "",
    transcript,
  ].join("\n")

  await Promise.allSettled([
    sendTranscriptEmail(input.content, text),
    pushTranscriptToLine(text),
  ])
}

function formatTranscript(messages: StoredChatMessage[]): string {
  return messages
    .slice(-30)
    .map((message) => `[${message.createdAt}] ${message.role.toUpperCase()}: ${message.text}`)
    .join("\n")
}

async function sendTranscriptEmail(content: SiteContent, text: string) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return
  const resend = new Resend(apiKey)
  const to = process.env.CHATBOT_TRANSCRIPT_EMAIL || content.chatbot.escalation.contactEmail || company.contactEmail
  const from = process.env.RESEND_FROM_EMAIL || "Tecxmate Chatbot <onboarding@resend.dev>"
  await resend.emails.send({
    from,
    to,
    subject: "Tecxmate chatbot escalation",
    text,
  })
}

async function pushTranscriptToLine(text: string) {
  if (process.env.CHATBOT_LINE_PUSH_URL && process.env.CHATBOT_LINE_PUSH_SECRET) {
    await pushViaTecxbot(text)
    return
  }
  await pushDirectLine(text)
}

async function pushViaTecxbot(text: string) {
  const url = process.env.CHATBOT_LINE_PUSH_URL
  const secret = process.env.CHATBOT_LINE_PUSH_SECRET
  const to = process.env.CHATBOT_LINE_TO
  if (!url || !secret || !to) return
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to,
      text: text.slice(0, 3800),
      channel: process.env.CHATBOT_LINE_CHANNEL || "tecxmate",
    }),
  })
  if (!res.ok) throw new Error(`LINE bridge failed: ${res.status} ${await res.text()}`)
}

async function pushDirectLine(text: string) {
  const token = process.env.CHATBOT_LINE_CHANNEL_ACCESS_TOKEN || process.env.TECXMATE_LINE_CHANNEL_ACCESS_TOKEN
  const to = process.env.CHATBOT_LINE_TO
  if (!token || !to) return
  const res = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to,
      messages: [{ type: "text", text: text.slice(0, 3800) }],
    }),
  })
  if (!res.ok) throw new Error(`LINE push failed: ${res.status} ${await res.text()}`)
}

function logOptionalIntegrationError(label: string, error: unknown) {
  console.error(`[${label}]`, error)
}
