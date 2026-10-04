"use client"

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage } from "ai"
import Markdown from "react-markdown"
import { CalendarDays, Check, Loader2, Mail, MessageCircle, MessageSquare, Phone, Send, X } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { company } from "@/lib/company"
import type { ChatbotConfig, Locale, Localized } from "@/lib/site-content"

const WHATSAPP_URL = "https://wa.me/886966860602"
/** WeChat has no reliable web link — the ID is copied to the clipboard instead. */
const WECHAT_ID = "nikolasdoan"

/** A contact is either a link (href) or a value to copy (copy) — never both. */
type ContactAction = {
  id: string
  label: string
  short: string
  bg: string
  icon: ReactNode
  href?: string
  copy?: string
}

type PublicChatbotConfig = Pick<
  ChatbotConfig,
  "enabled" | "title" | "subtitle" | "greeting" | "placeholder" | "quickQuestions" | "escalation" | "limits"
>

const fallbackText: Record<Locale, { title: string; subtitle: string; greeting: string; placeholder: string }> = {
  en: {
    title: "Tecxmate Assistant",
    subtitle: "Online",
    greeting: "Hi! Tell me what you want to build, automate, or clarify.",
    placeholder: "Ask about Tecxmate services...",
  },
  vi: {
    title: "Trợ lý Tecxmate",
    subtitle: "Trực tuyến",
    greeting: "Chào bạn! Hãy cho tôi biết bạn muốn xây dựng, tự động hóa hoặc cần làm rõ điều gì.",
    placeholder: "Hỏi về dịch vụ Tecxmate...",
  },
  zh: {
    title: "Tecxmate 助理",
    subtitle: "線上",
    greeting: "您好！請告訴我您想打造、導入自動化，或想釐清的問題。",
    placeholder: "詢問 Tecxmate 服務...",
  },
}

/**
 * Canned answers for the quick-question pills, keyed by quickQuestion id.
 * These never hit the model — the reply is known, so we stream it locally
 * instead of paying for (and waiting on) a generation. Anything typed by hand
 * still goes to the assistant. Edit the copy here; ids come from site-content.
 */
const SCRIPTED_ANSWERS: Record<string, Localized> = {
  services: {
    en: "Four things, mainly:\n\n1. **AI consulting and strategies** — we find where AI actually pays off, wire it into your systems, then train your team to run it.\n2. **iOS & Android apps** — designed, built, and published, with a web admin panel. MVP in about 6 weeks.\n3. **Modernizing legacy operations** — AI-drafted documents, one-tap approvals, answers over WhatsApp, LINE, and Telegram.\n4. **Getting you found in AI search** — so ChatGPT and Gemini name you when buyers ask.\n\nWhich one is closest to what you need?",
    vi: "Chủ yếu là bốn việc:\n\n1. **Tư vấn và chiến lược AI** — tìm nơi AI thực sự sinh lời, gắn vào hệ thống của bạn, rồi đào tạo đội ngũ vận hành.\n2. **Ứng dụng iOS & Android** — thiết kế, xây dựng, phát hành, kèm trang quản trị web. MVP khoảng 6 tuần.\n3. **Hiện đại hóa vận hành cũ** — tài liệu do AI soạn, phê duyệt một chạm, trả lời qua WhatsApp, LINE và Telegram.\n4. **Giúp bạn xuất hiện trên AI search** — để ChatGPT và Gemini gọi tên bạn khi khách hỏi.\n\nViệc nào gần với nhu cầu của bạn nhất?",
    zh: "主要有四項：\n\n1. **AI 顧問與策略** — 找出 AI 真正划算的落點，接進您的系統，再培訓團隊自行運作。\n2. **iOS 與 Android 應用程式** — 設計、開發、上架，附網頁後台。MVP 約 6 週。\n3. **傳統營運現代化** — AI 起草文件、一鍵核准，並透過 WhatsApp、LINE、Telegram 回覆。\n4. **讓您被 AI 搜尋找到** — 買家詢問時，ChatGPT 與 Gemini 會說出您的名字。\n\n哪一項最接近您的需求？",
  },
  cost: {
    en: "It depends on scope, so I won't guess a number. What I can tell you: the first consultation is free, projects typically start in the low five figures USD, and you get a fixed price before any work begins.\n\nThe fastest way to a real number is a short call — [book 30 minutes](https://cal.com/nikolasdoan/30min) and we'll scope it with you.",
    vi: "Chi phí phụ thuộc phạm vi nên tôi sẽ không đoán bừa. Điều tôi chắc chắn: buổi tư vấn đầu tiên miễn phí, dự án thường bắt đầu từ mức năm chữ số USD, và bạn sẽ có giá cố định trước khi bắt tay vào làm.\n\nCách nhanh nhất để có con số thật là một cuộc gọi ngắn — [đặt lịch 30 phút](https://cal.com/nikolasdoan/30min) và chúng tôi sẽ cùng bạn xác định phạm vi.",
    zh: "費用取決於專案範圍，所以我不會亂猜數字。可以確定的是：首次諮詢免費，專案通常從五位數美元起跳，並且在動工前就會給您固定報價。\n\n最快得到實際數字的方式是一通短短的通話 — [預約 30 分鐘](https://cal.com/nikolasdoan/30min)，我們一起把範圍談清楚。",
  },
  timeline: {
    en: "An MVP is usually about 6 weeks for a cross-platform app. Automation and AI integration often ship sooner, because they build on systems you already have.\n\nWe work in stages — Discover → Architect → Build & sync → Ship & support — so you see progress continuously rather than waiting for one big reveal.\n\nWant a date against your actual scope? [Book a 30-min call](https://cal.com/nikolasdoan/30min).",
    vi: "MVP cho ứng dụng đa nền tảng thường khoảng 6 tuần. Phần tự động hóa và tích hợp AI thường xong sớm hơn, vì dựa trên hệ thống bạn đã có.\n\nChúng tôi làm theo từng giai đoạn — Tìm hiểu → Thiết kế → Xây dựng & đồng bộ → Bàn giao & hỗ trợ — nên bạn thấy tiến độ liên tục chứ không phải chờ đến phút cuối.\n\nMuốn có mốc thời gian cho đúng phạm vi của bạn? [Đặt lịch gọi 30 phút](https://cal.com/nikolasdoan/30min).",
    zh: "跨平台應用的 MVP 通常約 6 週。自動化與 AI 整合往往更快，因為是接在您既有的系統上。\n\n我們分階段進行 — 探索 → 架構 → 開發與同步 → 上線與維運 — 您會持續看到進度，而不是等最後一次揭曉。\n\n想針對您的實際範圍抓時程嗎？[預約 30 分鐘通話](https://cal.com/nikolasdoan/30min)。",
  },
  human: {
    en: "Of course. Here are the fastest ways to reach Nikolas directly:\n\n- [Book a 30-min call](https://cal.com/nikolasdoan/30min)\n- [Chat on LINE](https://lin.ee/PHAOtCo)\n- [Message on WhatsApp](https://wa.me/886966860602)\n- WeChat ID: **nikolasdoan**\n- [official@tecxmate.com](mailto:official@tecxmate.com)\n\nOr tell me what you're working on and I'll make sure it reaches the team.",
    vi: "Tất nhiên rồi. Đây là những cách nhanh nhất để liên hệ trực tiếp với anh Nikolas:\n\n- [Đặt lịch gọi 30 phút](https://cal.com/nikolasdoan/30min)\n- [Nhắn tin qua LINE](https://lin.ee/PHAOtCo)\n- [Nhắn tin WhatsApp](https://wa.me/886966860602)\n- WeChat ID: **nikolasdoan**\n- [official@tecxmate.com](mailto:official@tecxmate.com)\n\nHoặc cứ kể tôi nghe bạn đang làm gì, tôi sẽ chuyển đến đội ngũ.",
    zh: "沒問題。以下是直接聯絡 Nikolas 最快的方式：\n\n- [預約 30 分鐘通話](https://cal.com/nikolasdoan/30min)\n- [透過 LINE 聯絡](https://lin.ee/PHAOtCo)\n- [WhatsApp 傳訊](https://wa.me/886966860602)\n- WeChat ID：**nikolasdoan**\n- [official@tecxmate.com](mailto:official@tecxmate.com)\n\n或者告訴我您正在規劃什麼，我會確保訊息送到團隊手上。",
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

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

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

/**
 * Assistant replies come back as Markdown — bold, lists, and the contact links
 * that are the whole point of the assistant. Rendered without raw-HTML support,
 * so model output cannot inject markup.
 */
function AssistantMarkdown({ text }: { text: string }) {
  return (
    <Markdown
      components={{
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline underline-offset-2 hover:opacity-80"
          >
            {children}
          </a>
        ),
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-4 last:mb-0">{children}</ul>,
        ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-4 last:mb-0">{children}</ol>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        code: ({ children }) => (
          <code className="rounded bg-foreground/10 px-1 py-0.5 text-[0.85em]">{children}</code>
        ),
      }}
    >
      {text}
    </Markdown>
  )
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
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [scriptThinking, setScriptThinking] = useState(false)
  const [scriptStreaming, setScriptStreaming] = useState(false)
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

  const { messages, setMessages, sendMessage, status, error, stop } = useChat({
    id: ids?.sessionId,
    transport,
    onError: (err) => console.error("[chatbot]", err),
  })

  const shown = open || closing
  const modelBusy = status === "submitted" || status === "streaming"
  const isBusy = modelBusy || scriptThinking || scriptStreaming
  const showTyping = modelBusy || scriptThinking
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

  /**
   * Play a canned answer as if the model were writing it: a short think pause,
   * then the text word by word. Keeps the pills instant and free while looking
   * identical to a real reply.
   */
  const playScriptedAnswer = async (question: string, answer: string) => {
    const userId = makeId("msg")
    const botId = makeId("msg")
    setMessages((prev) => [...prev, { id: userId, role: "user", parts: [{ type: "text", text: question }] }])

    setScriptThinking(true)
    await wait(500)
    setScriptThinking(false)

    setScriptStreaming(true)
    setMessages((prev) => [...prev, { id: botId, role: "assistant", parts: [{ type: "text", text: "" }] }])
    let shown = ""
    for (const token of answer.split(/(\s+)/)) {
      shown += token
      const text = shown
      setMessages((prev) => prev.map((m) => (m.id === botId ? { ...m, parts: [{ type: "text", text }] } : m)))
      await wait(token.trim() ? 16 + Math.random() * 26 : 8)
    }
    setScriptStreaming(false)
  }

  const copyContact = async (id: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      return // clipboard blocked (insecure origin / denied) — the title attribute still shows the ID
    }
    setCopiedId(id)
    setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 2000)
  }

  const submitText = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isBusy || !ids || !enabled) return
    setInput("")
    await sendMessage({ text: trimmed })
  }

  const contacts: ContactAction[] = [
    {
      id: "line",
      label: config?.escalation.lineLabel || "LINE",
      short: "LINE",
      href: config?.escalation.lineUrl || "https://lin.ee/PHAOtCo",
      bg: "#06C755",
      icon: <MessageCircle className="h-5 w-5" />,
    },
    { id: "whatsapp", label: "WhatsApp", short: "WhatsApp", href: WHATSAPP_URL, bg: "#25D366", icon: <Phone className="h-5 w-5" /> },
    { id: "wechat", label: `WeChat: ${WECHAT_ID} (click to copy)`, short: "WeChat", copy: WECHAT_ID, bg: "#07C160", icon: <MessageSquare className="h-5 w-5" /> },
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
                    className={`max-w-[86%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                      message.role === "user"
                        ? "whitespace-pre-wrap rounded-br-sm bg-primary text-white"
                        : "rounded-bl-sm bg-muted text-foreground"
                    }`}
                  >
                    {message.role === "user" ? text : <AssistantMarkdown text={text} />}
                  </span>
                </div>
              )
            })}
            {showTyping && <TypingBubble />}
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
                    const label = t(item.label, locale)
                    setAsked((prev) => [...prev, item.id])
                    const scripted = SCRIPTED_ANSWERS[item.id]
                    if (scripted) {
                      void playScriptedAnswer(label, t(scripted, locale))
                    } else {
                      void submitText(label)
                    }
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
            const copied = copiedId === contact.id
            const body = (
              <>
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-full text-white shadow-lg transition-transform group-hover:scale-110"
                  style={{ backgroundColor: contact.bg }}
                >
                  {copied ? <Check className="h-5 w-5" /> : contact.icon}
                </span>
                <span className="whitespace-nowrap rounded bg-card/80 px-1.5 py-0.5 text-[10px] font-medium leading-none text-foreground/90 shadow-sm backdrop-blur-sm">
                  {copied ? "Copied" : contact.short}
                </span>
              </>
            )
            const shared = {
              "aria-label": contact.label,
              title: contact.label,
              className: `group flex w-12 flex-col items-center gap-1 ${animClass}`,
              style: { animationDelay: `${index * 45}ms` },
            }

            // WeChat has no usable web link — copy the ID and confirm inline.
            if (contact.copy) {
              return (
                <button key={contact.id} type="button" onClick={() => copyContact(contact.id, contact.copy!)} {...shared}>
                  {body}
                </button>
              )
            }

            const isExternal = contact.href?.startsWith("http")
            return (
              <a
                key={contact.id}
                href={contact.href}
                {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                {...shared}
              >
                {body}
              </a>
            )
          })}
      </div>
    </div>
  )
}
