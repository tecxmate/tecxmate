import { NextRequest, NextResponse } from "next/server"
import { gateway } from "@ai-sdk/gateway"
import { convertToModelMessages, streamText, type UIMessage } from "ai"
import { z } from "zod"
import {
  appendChatMessages,
  buildSystemPrompt,
  enforceChatRateLimit,
  extractContactHint,
  isHumanEscalationRequest,
  loadVisitorMemory,
  normalizeLocale,
  notifyHuman,
  saveVisitorMemory,
  textFromUIMessage,
  type StoredChatMessage,
} from "@/lib/chatbot"
import { readContent } from "@/lib/site-content"

export const dynamic = "force-dynamic"
export const maxDuration = 30

const bodySchema = z.object({
  id: z.string().optional(),
  sessionId: z.string().optional(),
  visitorId: z.string().optional(),
  language: z.enum(["en", "vi", "zh"]).optional(),
  messages: z.array(z.any()),
})

export async function POST(request: NextRequest) {
  const content = await readContent()
  const config = content.chatbot

  if (!config.enabled) {
    return NextResponse.json({ error: "Chatbot is disabled." }, { status: 503 })
  }

  if (!process.env.AI_GATEWAY_API_KEY) {
    return NextResponse.json(
      { error: "AI_GATEWAY_API_KEY is not configured." },
      { status: 503 },
    )
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid chat request." }, { status: 400 })
  }

  const messages = parsed.data.messages as UIMessage[]
  const sessionId = cleanId(parsed.data.sessionId || parsed.data.id || "chat")
  const visitorId = cleanId(parsed.data.visitorId || sessionId)
  const language = normalizeLocale(parsed.data.language)
  const lastMessage = messages[messages.length - 1]
  const lastText = lastMessage ? textFromUIMessage(lastMessage) : ""

  if (!lastText) {
    return NextResponse.json({ error: "Message is empty." }, { status: 400 })
  }
  if (lastText.length > config.limits.maxInputChars) {
    return NextResponse.json(
      { error: `Message is too long. Limit is ${config.limits.maxInputChars} characters.` },
      { status: 413 },
    )
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown"
  const rate = await enforceChatRateLimit({
    sessionId,
    ip,
    limit: config.limits.maxMessagesPerHour,
  })
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Too many chat messages. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } },
    )
  }

  const now = new Date().toISOString()
  const contactHint = extractContactHint(lastText)
  const userStored: StoredChatMessage = { role: "user", text: lastText, createdAt: now }
  await appendChatMessages({
    sessionId,
    visitorId,
    language,
    retainDays: config.limits.retainDays,
    contactHint,
    messages: [userStored],
  })

  const memory = config.memoryEnabled ? await loadVisitorMemory(visitorId) : null
  const modelMessages = await convertToModelMessages(messages.slice(-24), {
    ignoreIncompleteToolCalls: true,
  })
  const transcriptSoFar = messages.map(toStoredMessage).filter(Boolean) as StoredChatMessage[]

  const result = streamText({
    model: gateway(process.env.CHATBOT_MODEL || "openai/gpt-5.1-mini"),
    system: buildSystemPrompt({ content, locale: language, memory }),
    messages: modelMessages,
    temperature: 0.3,
    onEnd: async ({ text }) => {
      await persistChatResult({
        assistantText: text.trim(),
        contactHint,
        content,
        language,
        lastText,
        memorySummary: memory?.summary,
        retainDays: config.limits.retainDays,
        saveMemory: config.memoryEnabled,
        sessionId,
        transcriptSoFar,
        visitorId,
      })
    },
  })

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    onError: (error) => {
      console.error("[chatbot]", error)
      return "The assistant had trouble responding. Please use LINE or email and our team will help."
    },
  })
}

async function persistChatResult(input: {
  assistantText: string
  contactHint?: string
  content: Awaited<ReturnType<typeof readContent>>
  language: ReturnType<typeof normalizeLocale>
  lastText: string
  memorySummary?: string
  retainDays: number
  saveMemory: boolean
  sessionId: string
  transcriptSoFar: StoredChatMessage[]
  visitorId: string
}) {
  try {
    const assistantStored: StoredChatMessage = {
      role: "assistant",
      text: input.assistantText,
      createdAt: new Date().toISOString(),
    }
    await appendChatMessages({
      sessionId: input.sessionId,
      visitorId: input.visitorId,
      language: input.language,
      retainDays: input.retainDays,
      contactHint: input.contactHint,
      messages: [assistantStored],
    })

    const shouldEscalate = Boolean(input.contactHint) || isHumanEscalationRequest(input.lastText)
    if (shouldEscalate) {
      await appendChatMessages({
        sessionId: input.sessionId,
        visitorId: input.visitorId,
        language: input.language,
        retainDays: input.retainDays,
        contactHint: input.contactHint,
        escalated: true,
        messages: [],
      })
      await notifyHuman({
        content: input.content,
        sessionId: input.sessionId,
        visitorId: input.visitorId,
        language: input.language,
        reason: input.contactHint ? "Customer volunteered contact details." : "Customer requested human support.",
        contactHint: input.contactHint,
        messages: [
          ...input.transcriptSoFar,
          assistantStored,
        ],
      })
    }

    if (input.saveMemory) {
      await saveVisitorMemory({
        visitorId: input.visitorId,
        retainDays: input.retainDays,
        summary: summarizeMemory(input.memorySummary, input.lastText, input.assistantText, input.contactHint),
      })
    }
  } catch (error) {
    console.error("[chatbot persistence]", error)
  }
}

function cleanId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80) || "chat"
}

function toStoredMessage(message: UIMessage): StoredChatMessage | null {
  if (message.role !== "user" && message.role !== "assistant" && message.role !== "system") return null
  const text = textFromUIMessage(message)
  if (!text) return null
  return {
    role: message.role,
    text,
    createdAt: new Date().toISOString(),
  }
}

function summarizeMemory(previous: string | undefined, userText: string, assistantText: string, contactHint?: string) {
  const lines = [
    previous?.trim(),
    contactHint ? `The visitor volunteered contact: ${contactHint}.` : undefined,
    `Recent need: ${userText.slice(0, 500)}`,
    assistantText ? `Recent assistant response: ${assistantText.slice(0, 500)}` : undefined,
  ].filter(Boolean)
  return lines.join("\n").slice(-1800)
}
