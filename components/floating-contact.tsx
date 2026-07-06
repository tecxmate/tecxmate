"use client"

import { useEffect, useRef, useState } from "react"
import { CalendarDays, Mail, MessageCircle, Phone, X } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { company } from "@/lib/company"

const LINE_URL = "https://lin.ee/PHAOtCo"
const WHATSAPP_URL = "https://wa.me/886966392602"

const BOOK_LABEL: Record<string, string> = {
  en: "Book a call",
  vi: "Đặt lịch gọi",
  zh: "預約通話",
}

/** Three bouncing dots — a live "typing…" cue that invites a tap. */
function TypingDots() {
  return (
    <span className="flex items-center gap-[3px]" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-white motion-safe:animate-[typing-bounce_1.3s_ease-in-out_infinite]"
          style={{ animationDelay: `${i * 160}ms` }}
        />
      ))}
    </span>
  )
}

export function FloatingContact() {
  const { language } = useLanguage()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  // Collapse when the user scrolls or taps elsewhere — AssistiveTouch style.
  useEffect(() => {
    if (!open) return
    const collapse = () => setOpen(false)
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener("scroll", collapse, { passive: true })
    document.addEventListener("pointerdown", onPointerDown)
    return () => {
      window.removeEventListener("scroll", collapse)
      document.removeEventListener("pointerdown", onPointerDown)
    }
  }, [open])

  const options = [
    { id: "line", label: "LINE", href: LINE_URL, bg: "#06C755", icon: <MessageCircle className="h-5 w-5" /> },
    { id: "whatsapp", label: "WhatsApp", href: WHATSAPP_URL, bg: "#25D366", icon: <Phone className="h-5 w-5" /> },
    { id: "email", label: "Email", href: `mailto:${company.contactEmail}`, bg: "#4B5563", icon: <Mail className="h-5 w-5" /> },
    { id: "booking", label: BOOK_LABEL[language] ?? BOOK_LABEL.en, href: company.social.booking, bg: "#8c52ff", icon: <CalendarDays className="h-5 w-5" /> },
  ]

  return (
    <div ref={rootRef} className="fixed bottom-24 right-8 z-50 flex flex-col-reverse items-end gap-3">
      {/* Main toggle — same shape as the back-to-top button, one slot higher */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close contact menu" : "Contact us"}
        aria-expanded={open}
        className="h-12 w-12 rounded-full bg-primary text-white shadow-lg flex items-center justify-center transition-transform duration-300 hover:scale-110"
      >
        {open ? <X className="h-5 w-5" /> : <TypingDots />}
      </button>

      {/* Contact options — revealed above the toggle when expanded */}
      {open &&
        options.map((opt, i) => {
          const isExternal = opt.href.startsWith("http")
          return (
            <a
              key={opt.id}
              href={opt.href}
              {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              aria-label={opt.label}
              className="flex items-center gap-2.5 motion-safe:animate-[fab-in_220ms_ease-out_both]"
              style={{ animationDelay: `${i * 45}ms` }}
            >
              <span className="rounded-full bg-card border border-border px-3 py-1 text-xs font-medium text-foreground shadow-sm whitespace-nowrap">
                {opt.label}
              </span>
              <span
                className="h-11 w-11 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110"
                style={{ backgroundColor: opt.bg }}
              >
                {opt.icon}
              </span>
            </a>
          )
        })}
    </div>
  )
}
