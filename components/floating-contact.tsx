"use client"

import { useEffect, useRef, useState } from "react"
import { CalendarDays, Mail, MessageCircle, Phone, X } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { company } from "@/lib/company"

const LINE_URL = "https://lin.ee/PHAOtCo"
const WHATSAPP_URL = "https://wa.me/886966392602"

type L = { en: string; vi: string; zh: string }
const tr = (l: L, lang: string): string => (l as Record<string, string>)[lang] ?? l.en

const NAME_SUBTITLE: L = {
  en: "Online · replies in minutes",
  vi: "Trực tuyến · phản hồi trong ít phút",
  zh: "線上 · 幾分鐘內回覆",
}
const GREETING: L = {
  en: "Hi! 👋 How can I help you? Tap a question below.",
  vi: "Chào bạn! 👋 Tôi có thể giúp gì? Chạm vào một câu hỏi bên dưới.",
  zh: "嗨！👋 有什麼能幫您？點下方任一問題。",
}
const BOOK_LABEL: L = { en: "Book a call", vi: "Đặt lịch gọi", zh: "預約通話" }

const FAQ: { id: string; q: L; a: L }[] = [
  {
    id: "build",
    q: { en: "What do you build?", vi: "Bạn xây dựng gì?", zh: "你們做什麼？" },
    a: {
      en: "Cross-platform mobile apps (iOS, Android + web admin), operations modernization & automation, and AI woven into your existing systems.",
      vi: "Ứng dụng di động đa nền tảng (iOS, Android + quản trị web), hiện đại hóa & tự động hóa vận hành, và AI tích hợp vào hệ thống sẵn có.",
      zh: "跨平台行動應用（iOS、Android 加網頁後台）、營運現代化與自動化，以及織入現有系統的 AI。",
    },
  },
  {
    id: "cost",
    q: { en: "How much does it cost?", vi: "Chi phí bao nhiêu?", zh: "費用大概多少？" },
    a: {
      en: "It depends on scope — but you get senior delivery without the overhead of hiring, usually a fraction of an in-house team. Tell us your project and we'll give a real number. The first consultation is free.",
      vi: "Tùy phạm vi — nhưng bạn có đội ngũ cấp cao mà không gánh chi phí tuyển dụng, thường chỉ bằng một phần đội in-house. Cho chúng tôi biết dự án, chúng tôi sẽ báo con số thực. Buổi tư vấn đầu tiên miễn phí.",
      zh: "視範圍而定——但您獲得資深交付而免去招募的負擔，通常只是自建團隊的零頭。告訴我們您的專案，我們會給出實際數字。首次諮詢免費。",
    },
  },
  {
    id: "time",
    q: { en: "How long does it take?", vi: "Mất bao lâu?", zh: "需要多久？" },
    a: {
      en: "An MVP typically ships in about 6 weeks, with same-day review cycles so you always see progress.",
      vi: "MVP thường ra mắt trong khoảng 6 tuần, với chu kỳ review trong ngày để bạn luôn thấy tiến độ.",
      zh: "MVP 通常約 6 週交付，並以當日回報的節奏讓您隨時掌握進度。",
    },
  },
  {
    id: "ai",
    q: { en: "Do you build AI?", vi: "Bạn có làm AI không?", zh: "你們做 AI 嗎？" },
    a: {
      en: "Yes — AI agents for documents, real-time voice, multilingual chatbots, and AI integrated into your existing stack. Your first AI consultation and training session is free.",
      vi: "Có — AI agent cho tài liệu, giọng nói thời gian thực, chatbot đa ngôn ngữ, và AI tích hợp vào hệ thống sẵn có. Buổi tư vấn và đào tạo AI đầu tiên miễn phí.",
      zh: "有——文件 AI 代理、即時語音、多語聊天機器人，以及整合進現有系統的 AI。首次 AI 諮詢與培訓免費。",
    },
  },
  {
    id: "human",
    q: { en: "Talk to a human", vi: "Nói chuyện với người thật", zh: "找真人聊聊" },
    a: {
      en: "Of course! Reach us on LINE, WhatsApp, or email — or book a free 30-min call. The buttons are right here. 👉",
      vi: "Tất nhiên! Liên hệ qua LINE, WhatsApp hoặc email — hoặc đặt lịch gọi 30 phút miễn phí. Các nút ở ngay đây. 👉",
      zh: "當然！透過 LINE、WhatsApp 或 email 聯絡我們——或預約免費 30 分鐘通話。按鈕就在這裡。👉",
    },
  },
]

type Msg = { from: "bot" | "user"; text: string }

/** Launcher dots — bounce a bit, then a long rest. */
function LauncherDots() {
  return (
    <span className="flex items-center gap-[3px]" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-white motion-safe:animate-[typing-idle_4s_ease-in-out_infinite]"
          style={{ animationDelay: `${i * 160}ms` }}
        />
      ))}
    </span>
  )
}

/** In-chat "typing…" indicator — continuous wave, shown briefly before a reply. */
function TypingBubble() {
  return (
    <div className="flex justify-start">
      <span className="inline-flex items-center gap-[3px] rounded-2xl rounded-bl-sm bg-muted px-3.5 py-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-muted-foreground motion-safe:animate-[typing-bounce_1.6s_ease-in-out_infinite]"
            style={{ animationDelay: `${i * 160}ms` }}
          />
        ))}
      </span>
    </div>
  )
}

export function FloatingContact() {
  const { language } = useLanguage()
  const [open, setOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([])
  const [typing, setTyping] = useState(false)
  const [asked, setAsked] = useState<string[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  // Keep the stack mounted through the exit animation, then unmount.
  const shown = open || closing
  const openUp = () => {
    setClosing(false)
    setOpen(true)
  }
  const collapse = () => {
    setOpen(false)
    setClosing(true)
  }
  const animClass = closing
    ? "motion-safe:animate-[fab-out_200ms_ease-in_both]"
    : "motion-safe:animate-[fab-in_220ms_ease-out_both]"

  useEffect(() => {
    if (!closing) return
    // cover the last icon's stagger delay (3 × 45ms) plus the 200ms exit.
    const t = setTimeout(() => setClosing(false), 360)
    return () => clearTimeout(t)
  }, [closing])

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ from: "bot", text: tr(GREETING, language) }])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, typing])

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((t) => clearTimeout(t))
  }, [])

  const ask = (item: (typeof FAQ)[number]) => {
    if (asked.includes(item.id) || typing) return
    setAsked((a) => [...a, item.id])
    setMessages((m) => [...m, { from: "user", text: tr(item.q, language) }])
    setTyping(true)
    const t = setTimeout(() => {
      setTyping(false)
      setMessages((m) => [...m, { from: "bot", text: tr(item.a, language) }])
    }, 1400)
    timers.current.push(t)
  }

  const remaining = FAQ.filter((f) => !asked.includes(f.id))

  const contacts = [
    { id: "line", label: "LINE", short: "LINE", href: LINE_URL, bg: "#06C755", icon: <MessageCircle className="h-5 w-5" /> },
    { id: "whatsapp", label: "WhatsApp", short: "WhatsApp", href: WHATSAPP_URL, bg: "#25D366", icon: <Phone className="h-5 w-5" /> },
    { id: "email", label: "Email", short: "Mail", href: `mailto:${company.contactEmail}`, bg: "#4B5563", icon: <Mail className="h-5 w-5" /> },
    { id: "booking", label: tr(BOOK_LABEL, language), short: "Meet", href: company.social.booking, bg: "#8c52ff", icon: <CalendarDays className="h-5 w-5" /> },
  ]

  return (
    <div className="fixed bottom-24 right-8 z-50 flex items-end gap-3">
      {/* Chat window — sits to the left of the button column */}
      {shown && (
        <div className={`w-[min(340px,calc(100vw-7.5rem))] h-[460px] max-h-[70vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden origin-bottom-right ${animClass}`}>
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-primary text-white shrink-0">
            <span className="relative h-9 w-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <MessageCircle className="h-5 w-5" aria-hidden />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-400 border-2 border-primary" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-tight font-accent italic">tecxmate</p>
              <p className="text-[11px] text-white/80 leading-tight">{tr(NAME_SUBTITLE, language)}</p>
            </div>
            <button
              type="button"
              onClick={collapse}
              aria-label="Close chat"
              className="p-1 rounded-full hover:bg-white/15 transition-colors"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-2.5 bg-muted/20">
            {messages.map((m, i) => (
              <div key={i} className={m.from === "user" ? "flex justify-end" : "flex justify-start"}>
                <span
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                    m.from === "user"
                      ? "bg-primary text-white rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  }`}
                >
                  {m.text}
                </span>
              </div>
            ))}
            {typing && <TypingBubble />}
          </div>

          {/* Quick-reply chips */}
          {remaining.length > 0 && (
            <div className="px-3 py-3 border-t border-border flex flex-wrap gap-1.5 shrink-0">
              {remaining.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => ask(f)}
                  disabled={typing}
                  className="rounded-full border border-primary/40 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-white disabled:opacity-50"
                >
                  {tr(f.q, language)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Button column — same old position on the right */}
      <div className="flex flex-col-reverse items-center gap-3 shrink-0">
        {/* Launcher / toggle */}
        <button
          type="button"
          onClick={() => (open ? collapse() : openUp())}
          aria-label={open ? "Close chat" : "Chat with us"}
          aria-expanded={open}
          className="h-12 w-12 rounded-full bg-primary text-white shadow-lg flex items-center justify-center transition-transform duration-300 hover:scale-110"
        >
          {shown ? <X className="h-5 w-5 pointer-events-none" aria-hidden /> : <LauncherDots />}
        </button>

        {/* Contact icons fan up above the launcher */}
        {shown &&
          contacts.map((c, i) => {
            const isExternal = c.href.startsWith("http")
            return (
              <a
                key={c.id}
                href={c.href}
                {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                aria-label={c.label}
                title={c.label}
                className={`group flex flex-col items-center gap-1 ${animClass}`}
                style={{ animationDelay: `${i * 45}ms` }}
              >
                <span
                  className="h-11 w-11 rounded-full flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110"
                  style={{ backgroundColor: c.bg }}
                >
                  {c.icon}
                </span>
                <span className="text-[10px] font-medium leading-none text-foreground/90 bg-card/80 backdrop-blur-sm px-1.5 py-0.5 rounded shadow-sm">
                  {c.short}
                </span>
              </a>
            )
          })}
      </div>
    </div>
  )
}
