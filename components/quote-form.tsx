"use client"

import { useState, type FormEvent } from "react"
import { Check, Loader2 } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import type { Locale } from "@/lib/site-content"

type Copy = {
  name: string
  company: string
  email: string
  phone: string
  contactHint: string
  preferred: string
  service: string
  budget: string
  timeline: string
  details: string
  detailsPlaceholder: string
  submit: string
  sending: string
  doneTitle: string
  doneBody: string
  required: string
  optional: string
  genericError: string
}

const COPY: Record<Locale, Copy> = {
  en: {
    name: "Your name", company: "Company", email: "Email", phone: "Phone",
    contactHint: "Give us an email or a phone number — either is fine.",
    preferred: "Best way to reach you", service: "What do you need?",
    budget: "Budget", timeline: "Timeline", details: "Tell us about the project",
    detailsPlaceholder: "What are you trying to build, fix, or find out? A few lines is plenty.",
    submit: "Send request", sending: "Sending…",
    doneTitle: "Got it — thank you.",
    doneBody: "We read every request ourselves. Expect a reply within one business day.",
    required: "required", optional: "optional",
    genericError: "Something went wrong. Please try again, or email us directly.",
  },
  vi: {
    name: "Tên của bạn", company: "Công ty", email: "Email", phone: "Số điện thoại",
    contactHint: "Để lại email hoặc số điện thoại — cái nào cũng được.",
    preferred: "Cách liên hệ thuận tiện nhất", service: "Bạn cần gì?",
    budget: "Ngân sách", timeline: "Thời gian", details: "Kể cho chúng tôi về dự án",
    detailsPlaceholder: "Bạn muốn xây, sửa, hay tìm hiểu điều gì? Vài dòng là đủ.",
    submit: "Gửi yêu cầu", sending: "Đang gửi…",
    doneTitle: "Đã nhận — cảm ơn bạn.",
    doneBody: "Chúng tôi đọc từng yêu cầu. Bạn sẽ nhận phản hồi trong vòng một ngày làm việc.",
    required: "bắt buộc", optional: "không bắt buộc",
    genericError: "Có lỗi xảy ra. Vui lòng thử lại hoặc email trực tiếp cho chúng tôi.",
  },
  zh: {
    name: "您的姓名", company: "公司", email: "電子郵件", phone: "電話",
    contactHint: "留下 email 或電話都可以。",
    preferred: "最方便的聯絡方式", service: "您需要什麼？",
    budget: "預算", timeline: "時程", details: "談談您的專案",
    detailsPlaceholder: "您想打造、修復或釐清什麼？幾行字就夠了。",
    submit: "送出需求", sending: "傳送中…",
    doneTitle: "已收到，謝謝您。",
    doneBody: "每一則需求我們都會親自閱讀，一個工作天內回覆您。",
    required: "必填", optional: "選填",
    genericError: "發生錯誤，請再試一次，或直接寄信給我們。",
  },
}

const SERVICES: Record<Locale, [string, string][]> = {
  en: [
    ["ai-agents", "AI agents, chatbots and knowledge"], ["apps", "iOS & Android apps"],
    ["modernize", "Modernize legacy operations"], ["ai-seo", "Get found in AI search"],
    ["data", "Data analytics and processing"], ["ai-integration", "AI consulting and strategy"],
    ["not-sure", "Not sure yet — help me work it out"],
  ],
  vi: [
    ["ai-agents", "AI agent, chatbot và tri thức"], ["apps", "Ứng dụng iOS & Android"],
    ["modernize", "Hiện đại hóa vận hành cũ"], ["ai-seo", "Xuất hiện trên AI search"],
    ["data", "Phân tích và xử lý dữ liệu"], ["ai-integration", "Tư vấn và chiến lược AI"],
    ["not-sure", "Chưa rõ — cần tư vấn thêm"],
  ],
  zh: [
    ["ai-agents", "AI 代理、聊天機器人與知識庫"], ["apps", "iOS 與 Android 應用程式"],
    ["modernize", "傳統營運現代化"], ["ai-seo", "讓 AI 搜尋找到您"],
    ["data", "資料分析與處理"], ["ai-integration", "AI 顧問與策略"],
    ["not-sure", "還不確定——希望有人幫我釐清"],
  ],
}

const BUDGETS: Record<Locale, [string, string][]> = {
  en: [["not-decided", "Not decided yet"], ["under-10k", "Under $10k"], ["10-30k", "$10k – $30k"], ["30-100k", "$30k – $100k"], ["over-100k", "Over $100k"]],
  vi: [["not-decided", "Chưa quyết định"], ["under-10k", "Dưới $10k"], ["10-30k", "$10k – $30k"], ["30-100k", "$30k – $100k"], ["over-100k", "Trên $100k"]],
  zh: [["not-decided", "尚未決定"], ["under-10k", "$10k 以下"], ["10-30k", "$10k – $30k"], ["30-100k", "$30k – $100k"], ["over-100k", "$100k 以上"]],
}

const TIMELINES: Record<Locale, [string, string][]> = {
  en: [["exploring", "Just exploring"], ["asap", "As soon as possible"], ["1-3-months", "1 – 3 months"], ["3-6-months", "3 – 6 months"]],
  vi: [["exploring", "Đang tìm hiểu"], ["asap", "Càng sớm càng tốt"], ["1-3-months", "1 – 3 tháng"], ["3-6-months", "3 – 6 tháng"]],
  zh: [["exploring", "先了解看看"], ["asap", "越快越好"], ["1-3-months", "1 – 3 個月"], ["3-6-months", "3 – 6 個月"]],
}

const CONTACTS: Record<Locale, [string, string][]> = {
  en: [["email", "Email"], ["phone", "Phone"], ["line", "LINE"], ["whatsapp", "WhatsApp"], ["wechat", "WeChat"]],
  vi: [["email", "Email"], ["phone", "Điện thoại"], ["line", "LINE"], ["whatsapp", "WhatsApp"], ["wechat", "WeChat"]],
  zh: [["email", "電子郵件"], ["phone", "電話"], ["line", "LINE"], ["whatsapp", "WhatsApp"], ["wechat", "WeChat"]],
}

const field = "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
const labelCls = "mb-1.5 block text-sm font-medium text-foreground"

function Label({ children, note }: { children: string; note?: string }) {
  return (
    <span className={labelCls}>
      {children}
      {note && <span className="ml-1.5 text-xs font-normal text-muted-foreground">({note})</span>}
    </span>
  )
}

export function QuoteForm({ conversationId }: { conversationId?: string }) {
  const { language } = useLanguage()
  const locale = (language === "vi" || language === "zh" ? language : "en") as Locale
  const c = COPY[locale]

  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle")
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setStatus("sending")

    const data = Object.fromEntries(new FormData(event.currentTarget))
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, language: locale, conversationId: conversationId || "" }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        setError(json?.error || c.genericError)
        setStatus("idle")
        return
      }
      setStatus("done")
    } catch {
      setError(c.genericError)
      setStatus("idle")
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-8 text-center">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
          <Check className="h-6 w-6" strokeWidth={3} />
        </span>
        <h2 className="text-xl font-semibold text-foreground">{c.doneTitle}</h2>
        <p className="mt-2 text-muted-foreground">{c.doneBody}</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Honeypot — hidden from people, irresistible to bots */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <Label note={c.required}>{c.name}</Label>
          <input name="name" required maxLength={120} className={field} />
        </label>
        <label>
          <Label note={c.optional}>{c.company}</Label>
          <input name="company" maxLength={160} className={field} />
        </label>
      </div>

      <div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <Label>{c.email}</Label>
            <input type="email" name="email" maxLength={200} className={field} />
          </label>
          <label>
            <Label>{c.phone}</Label>
            <input name="phone" maxLength={60} className={field} />
          </label>
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">{c.contactHint}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <Label>{c.preferred}</Label>
          <select name="preferredContact" defaultValue="email" className={field}>
            {CONTACTS[locale].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
        <label>
          <Label>{c.service}</Label>
          <select name="service" defaultValue="not-sure" className={field}>
            {SERVICES[locale].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
        <label>
          <Label>{c.budget}</Label>
          <select name="budget" defaultValue="not-decided" className={field}>
            {BUDGETS[locale].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
        <label>
          <Label>{c.timeline}</Label>
          <select name="timeline" defaultValue="exploring" className={field}>
            {TIMELINES[locale].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
      </div>

      <label className="block">
        <Label note={c.required}>{c.details}</Label>
        <textarea name="details" required rows={5} maxLength={4000} placeholder={c.detailsPlaceholder} className={`${field} resize-y`} />
      </label>

      {error && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {status === "sending" && <Loader2 className="h-4 w-4 animate-spin" />}
        {status === "sending" ? c.sending : c.submit}
      </button>
    </form>
  )
}
