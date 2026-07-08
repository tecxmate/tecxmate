import "server-only"

import { createHash } from "crypto"
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

export function buildSystemPrompt(input: {
  content: SiteContent
  locale: Locale
  memory?: VisitorMemory | null
}): string {
  const { content, locale, memory } = input
  return [
    localized(content.chatbot.systemPrompt, locale),
    "",
    "Escalation behavior:",
    localized(content.chatbot.escalation.message, locale),
    "If escalation is useful, call the escalateToHuman tool and then tell the customer the best contact point. Do not ask for contact details unless the customer volunteers them or asks for follow-up.",
    "",
    memory?.summary ? `Known returning-visitor memory:\n${memory.summary}` : "Known returning-visitor memory: none.",
    "",
    "Tecxmate knowledge:",
    buildChatbotKnowledge(content, locale),
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
