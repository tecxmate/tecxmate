"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage } from "ai"
import { CalendarDays, Loader2, Mail, MessageCircle, Phone, Send, X } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { company } from "@/lib/company"
import type { ChatbotConfig, Locale, Localized } from "@/lib/site-content"

const WHATSAPP_URL = "https://wa.me/886966392602"

type PublicChatbotConfig = Pick<
  ChatbotConfig,
  "enabled" | "title" | "subtitle" | "greeting" | "placeholder" | "quickQuestions" | "escalation" | "limits"
>

const fallbackText: Record<Locale, { title: string; subtitle: string; greeting: string; placeholder: string }> = {
  en: {
    title: "Tecxmate Assistant",
    subtitle: "Online · can hand off to LINE",
    greeting: "Hi! Tell me what you want to build, automate, or clarify.",
    placeholder: "Ask about Tecxmate services...",
  },
  vi: {
    title: "Trợ lý Tecxmate",
    subtitle: "Trực tuyến · có thể chuyển sang LINE",
    greeting: "Chào bạn! Hãy cho tôi biết bạn muốn xây dựng, tự động hóa hoặc cần làm rõ điều gì.",
    placeholder: "Hỏi về dịch vụ Tecxmate...",
  },
  zh: {
    title: "Tecxmate 助理",
    subtitle: "線上 · 可轉接 LINE",
    greeting: "您好！請告訴我您想打造、導入自動化，或想釐清的問題。",
    placeholder: "詢問 Tecxmate 服務...",
  },
}

function normalizeLocale(value: string): Locale {
  return value === "vi" || value === "zh" ? value : "en"
}

function t(value: Localized | undefined, locale: Locale, fallback = "") {
  return value?.[locale] || value?.en || fallback
}

function makeId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

function getStoredIds() {
  const visitorKey = "tecxmate:chatbot:visitor-id"
  const sessionKey = "tecxmate:chatbot:session-id"
  let visitorId = localStorage.getItem(visitorKey)
  let sessionId = sessionStorage.getItem(sessionKey)
  if (!visitorId) {
    visitorId = makeId("visitor")
    localStorage.setItem(visitorKey, visitorId)
  }
  if (!sessionId) {
    sessionId = makeId("session")
    sessionStorage.setItem(sessionKey, sessionId)
  }
  return { visitorId, sessionId }
}

function messageText(message: UIMessage) {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("")
}

function LauncherDots() {
  return (
    <span className="flex items-center gap-[3px]" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-white motion-safe:animate-[typing-idle_4s_ease-in-out_infinite]"
          style={{ animationDelay: `${i * 160}ms` }}
        />
      ))}
    </span>
  )
}

function TypingBubble() {
  return (
    <div className="flex justify-start">
      <span className="inline-flex items-center gap-[3px] rounded-2xl rounded-bl-sm bg-muted px-3.5 py-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-muted-foreground motion-safe:animate-[typing-bounce_1.6s_ease-in-out_infinite]"
            style={{ animationDelay: `${i * 160}ms` }}
          />
        ))}
      </span>
    </div>
  )
}

export function FloatingContact() {
  const { language } = useLanguage()
  const locale = normalizeLocale(language)
  const [ids, setIds] = useState<{ visitorId: string; sessionId: string } | null>(null)
  const [config, setConfig] = useState<PublicChatbotConfig | null>(null)
  const [open, setOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const [input, setInput] = useState("")
  const [asked, setAsked] = useState<string[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIds(getStoredIds())
  }, [])

  useEffect(() => {
    fetch("/api/chatbot/config", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: PublicChatbotConfig | null) => {
        if (data) setConfig(data)
      })
      .catch(() => {})
  }, [])

  const transport = useMemo(
    () => new DefaultChatTransport({
      api: "/api/chat",
      body: {
        sessionId: ids?.sessionId || "pending",
        visitorId: ids?.visitorId || "pending",
        language: locale,
      },
    }),
    [ids?.sessionId, ids?.visitorId, locale],
  )

  const { messages, sendMessage, status, error, stop } = useChat({
    id: ids?.sessionId,
    transport,
    onError: (err) => console.error("[chatbot]", err),
  })

  const shown = open || closing
  const isBusy = status === "submitted" || status === "streaming"
  const copy = fallbackText[locale]
  const enabled = config?.enabled !== false
  const title = t(config?.title, locale, copy.title)
  const subtitle = t(config?.subtitle, locale, copy.subtitle)
  const greeting = t(config?.greeting, locale, copy.greeting)
  const placeholder = t(config?.placeholder, locale, copy.placeholder)
  const quickQuestions = config?.quickQuestions ?? []

  const animClass = closing
    ? "motion-safe:animate-[fab-out_200ms_ease-in_both]"
    : "motion-safe:animate-[fab-in_220ms_ease-out_both]"

  useEffect(() => {
    if (!closing) return
    const timer = setTimeout(() => setClosing(false), 360)
    return () => clearTimeout(timer)
  }, [closing])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, isBusy, open])

  const openUp = () => {
    setClosing(false)
    setOpen(true)
  }

  const collapse = () => {
    if (isBusy) stop()
    setOpen(false)
    setClosing(true)
  }

  const submitText = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isBusy || !ids || !enabled) return
    setInput("")
    await sendMessage({ text: trimmed })
  }

  const contacts = [
    {
      id: "line",
      label: config?.escalation.lineLabel || "LINE",
      short: "LINE",
      href: config?.escalation.lineUrl || "https://lin.ee/PHAOtCo",
      bg: "#06C755",
      icon: <MessageCircle className="h-5 w-5" />,
    },
    { id: "whatsapp", label: "WhatsApp", short: "WhatsApp", href: WHATSAPP_URL, bg: "#25D366", icon: <Phone className="h-5 w-5" /> },
    { id: "email", label: "Email", short: "Mail", href: `mailto:${config?.escalation.contactEmail || company.contactEmail}`, bg: "#4B5563", icon: <Mail className="h-5 w-5" /> },
    { id: "booking", label: "Book a call", short: "Meet", href: company.social.booking, bg: "#8c52ff", icon: <CalendarDays className="h-5 w-5" /> },
  ]

  if (!enabled) return null

  return (
    <div className="fixed bottom-24 right-8 z-50 flex items-end gap-3">
      {shown && (
        <div className={`flex h-[520px] max-h-[74vh] w-[min(380px,calc(100vw-7.5rem))] origin-bottom-right flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl ${animClass}`}>
          <div className="flex shrink-0 items-center gap-3 bg-primary px-4 py-3 text-white">
            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20">
              <MessageCircle className="h-5 w-5" aria-hidden />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-primary bg-green-400" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-accent text-sm font-semibold italic leading-tight">{title}</p>
              <p className="truncate text-[11px] leading-tight text-white/80">{subtitle}</p>
            </div>
            <button
              type="button"
              onClick={collapse}
              aria-label="Close chat"
              className="rounded-full p-1 transition-colors hover:bg-white/15"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-2.5 overflow-y-auto bg-muted/20 px-3 py-4">
            <div className="flex justify-start">
              <span className="max-w-[86%] rounded-2xl rounded-bl-sm bg-muted px-3.5 py-2 text-sm leading-relaxed text-foreground">
                {greeting}
              </span>
            </div>

            {messages.map((message) => {
              const text = messageText(message)
              if (!text) return null
              return (
                <div key={message.id} className={message.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <span
                    className={`max-w-[86%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                      message.role === "user"
                        ? "rounded-br-sm bg-primary text-white"
                        : "rounded-bl-sm bg-muted text-foreground"
                    }`}
                  >
                    {text}
                  </span>
                </div>
              )
            })}
            {isBusy && <TypingBubble />}
            {error && (
              <div className="flex justify-start">
                <span className="max-w-[86%] rounded-2xl rounded-bl-sm bg-destructive/10 px-3.5 py-2 text-sm leading-relaxed text-destructive">
                  The assistant had trouble responding. Please use LINE or email and our team will help.
                </span>
              </div>
            )}
          </div>

          {messages.length === 0 && quickQuestions.length > 0 && (
            <div className="flex shrink-0 flex-wrap gap-1.5 border-t border-border px-3 py-3">
              {quickQuestions.filter((item) => !asked.includes(item.id)).slice(0, 4).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setAsked((prev) => [...prev, item.id])
                    void submitText(t(item.label, locale))
                  }}
                  disabled={isBusy || !ids}
                  className="rounded-full border border-primary/40 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-white disabled:opacity-50"
                >
                  {t(item.label, locale)}
                </button>
              ))}
            </div>
          )}

          <form
            className="flex shrink-0 items-end gap-2 border-t border-border bg-card p-3"
            onSubmit={(event) => {
              event.preventDefault()
              void submitText(input)
            }}
          >
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value.slice(0, config?.limits.maxInputChars || 1200))}
              placeholder={placeholder}
              rows={1}
              className="max-h-24 min-h-10 flex-1 resize-none rounded-xl border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault()
                  void submitText(input)
                }
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isBusy || !ids}
              aria-label="Send message"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 disabled:opacity-50"
            >
              {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
        </div>
      )}

      <div className="flex shrink-0 flex-col-reverse items-center gap-3">
        <button
          type="button"
          onClick={() => (open ? collapse() : openUp())}
          aria-label={open ? "Close chat" : "Chat with us"}
          aria-expanded={open}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform duration-300 hover:scale-110"
        >
          {shown ? <X className="h-5 w-5 pointer-events-none" aria-hidden /> : <LauncherDots />}
        </button>

        {shown &&
          contacts.map((contact, index) => {
            const isExternal = contact.href.startsWith("http")
            return (
              <a
                key={contact.id}
                href={contact.href}
                {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                aria-label={contact.label}
                title={contact.label}
                className={`group flex w-12 flex-col items-center gap-1 ${animClass}`}
                style={{ animationDelay: `${index * 45}ms` }}
              >
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-full text-white shadow-lg transition-transform group-hover:scale-110"
                  style={{ backgroundColor: contact.bg }}
                >
                  {contact.icon}
                </span>
                <span className="whitespace-nowrap rounded bg-card/80 px-1.5 py-0.5 text-[10px] font-medium leading-none text-foreground/90 shadow-sm backdrop-blur-sm">
                  {contact.short}
                </span>
              </a>
            )
          })}
      </div>
    </div>
  )
}
