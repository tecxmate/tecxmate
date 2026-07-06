"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  Bot,
  Check,
  ChevronLeft,
  ChevronRight,
  Cloud,
  CreditCard,
  FileText,
  MessageSquare,
  Mic,
  ServerCog,
  Smartphone,
  Volume2,
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { salesDeck, pickLocale } from "@/lib/sales-deck"

const WAVE_DELAYS = ["0ms", "120ms", "240ms", "360ms", "480ms"]

function Waveform() {
  return (
    <span className="flex items-center gap-[3px] h-6" aria-hidden>
      {WAVE_DELAYS.map((delay) => (
        <span
          key={delay}
          className="w-[3px] h-2 rounded-full bg-primary motion-safe:animate-[deck-wave_1.6s_ease-in-out_infinite]"
          style={{ animationDelay: delay }}
        />
      ))}
    </span>
  )
}

/** Big icon tile — the anchor of each demo. */
function Core({ icon: Icon }: { icon: typeof Bot }) {
  return (
    <span className="w-16 h-16 shrink-0 rounded-2xl bg-primary flex items-center justify-center motion-safe:animate-[deck-glow_3s_ease-out_infinite]">
      <Icon className="w-7 h-7 text-white" aria-hidden />
    </span>
  )
}

/** Short connector with a travelling dot. */
function MiniWire() {
  return (
    <span className="relative w-8 h-px shrink-0 bg-border" aria-hidden>
      <span className="absolute top-1/2 -translate-y-1/2 left-0 w-1.5 h-1.5 rounded-full bg-primary motion-safe:animate-[deck-travel_3s_linear_infinite]" />
    </span>
  )
}

function CheckBadge() {
  return (
    <span className="w-9 h-9 shrink-0 rounded-full bg-primary text-white flex items-center justify-center motion-safe:animate-[deck-pop_3s_ease-in-out_infinite]">
      <Check className="w-4 h-4" strokeWidth={3} aria-hidden />
    </span>
  )
}

const ASSEMBLE = "motion-safe:animate-[deck-assemble_3s_ease-in-out_infinite]"

function ChatBubble({ label, delay, alignRight }: { label: string; delay: string; alignRight?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/5 px-2.5 py-1 text-[11px] text-foreground ${alignRight ? "self-end" : "self-start"} ${ASSEMBLE}`}
      style={{ animationDelay: delay }}
    >
      <MessageSquare className="w-3 h-3 text-primary" aria-hidden />
      {label}
    </span>
  )
}

/** Simplified per-technology demo. Small, uniform, pure-CSS motion. */
function TechDemo({ icon }: { icon: string }) {
  const base = "h-28 flex items-center justify-center gap-3"

  if (icon === "mic") {
    return (
      <div className={base} aria-hidden>
        <Waveform />
        <Core icon={Mic} />
        <MiniWire />
        <Core icon={Volume2} />
        <Waveform />
      </div>
    )
  }

  if (icon === "bot") {
    return (
      <div className={base} aria-hidden>
        <Core icon={Bot} />
        <MiniWire />
        <span className="relative">
          <FileText className="w-11 h-11 text-zinc-400 dark:text-zinc-500" strokeWidth={1.5} />
          <span className="absolute -right-1.5 -bottom-1.5">
            <CheckBadge />
          </span>
        </span>
      </div>
    )
  }

  if (icon === "message-square") {
    return (
      <div className="h-28 flex flex-col items-stretch justify-center gap-1.5 w-40 mx-auto" aria-hidden>
        <ChatBubble label="中文" delay="0ms" />
        <ChatBubble label="Tiếng Việt" delay="500ms" alignRight />
        <ChatBubble label="English" delay="1000ms" />
      </div>
    )
  }

  if (icon === "credit-card") {
    return (
      <div className={base} aria-hidden>
        <Core icon={CreditCard} />
        <MiniWire />
        <CheckBadge />
      </div>
    )
  }

  if (icon === "smartphone") {
    return (
      <div className={base} aria-hidden>
        <Core icon={Smartphone} />
        <span className="flex items-center gap-0.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <svg
              key={i}
              viewBox="0 0 10 14"
              className="w-2.5 h-3.5 text-primary motion-safe:animate-[deck-thrust_1.6s_ease-in-out_infinite]"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <path d="M2 1 L8 7 L2 13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ))}
        </span>
        <Core icon={Cloud} />
      </div>
    )
  }

  if (icon === "server-cog") {
    return (
      <div className={base} aria-hidden>
        <span className="flex flex-col gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`w-2.5 h-2.5 rounded-sm bg-primary/40 ${ASSEMBLE}`}
              style={{ animationDelay: `${i * 300}ms` }}
            />
          ))}
        </span>
        <MiniWire />
        <Core icon={ServerCog} />
      </div>
    )
  }

  // cloud
  return (
    <div className={base} aria-hidden>
      <Core icon={Cloud} />
      <span className="flex flex-col gap-2.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="relative w-8 h-px bg-border">
            <span
              className="absolute top-1/2 -translate-y-1/2 left-0 w-1.5 h-1.5 rounded-full bg-primary motion-safe:animate-[deck-travel_3s_linear_infinite]"
              style={{ animationDelay: `${i * 300}ms` }}
            />
          </span>
        ))}
      </span>
      <span className="flex flex-col gap-2">
        {[0, 1, 2].map((i) => (
          <span key={i} className="w-3 h-3 rounded-md border-2 border-zinc-400 dark:border-zinc-500" />
        ))}
      </span>
    </div>
  )
}

export function TechnologySection() {
  const { language } = useLanguage()
  const { technology } = salesDeck
  const items = technology.items
  const count = items.length

  const [active, setActive] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef(0)
  activeRef.current = active
  const pausedRef = useRef(false)

  const scrollToIndex = useCallback((i: number) => {
    const track = trackRef.current
    if (!track) return
    const clamped = Math.max(0, Math.min(i, track.children.length - 1))
    const el = track.children[clamped] as HTMLElement | undefined
    if (!el) return
    const left = el.offsetLeft - (track.clientWidth - el.offsetWidth) / 2
    track.scrollTo({ left, behavior: "smooth" })
  }, [])

  // Track which slide is centered.
  const handleScroll = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const center = track.scrollLeft + track.clientWidth / 2
    let best = 0
    let bestDist = Infinity
    Array.from(track.children).forEach((child, i) => {
      const el = child as HTMLElement
      const childCenter = el.offsetLeft + el.offsetWidth / 2
      const dist = Math.abs(childCenter - center)
      if (dist < bestDist) {
        bestDist = dist
        best = i
      }
    })
    setActive(best)
  }, [])

  // Gentle auto-advance; pauses on hover and respects reduced motion.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const id = setInterval(() => {
      if (pausedRef.current) return
      scrollToIndex((activeRef.current + 1) % count)
    }, 4500)
    return () => clearInterval(id)
  }, [count, scrollToIndex])

  return (
    <section id="technology" className="bg-background py-20 md:py-24">
      <div className="container px-4 md:px-6 max-w-6xl">
        <h2 className="text-3xl font-semibold md:text-4xl lg:text-5xl tracking-tight text-foreground mb-3">
          {pickLocale(technology.title, language)}
        </h2>
        <p className="text-muted-foreground mb-10 max-w-2xl">
          {pickLocale(technology.subtitle, language)}
        </p>

        <div
          className="relative"
          onPointerEnter={() => (pausedRef.current = true)}
          onPointerLeave={() => (pausedRef.current = false)}
        >
          <div
            ref={trackRef}
            onScroll={handleScroll}
            className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 -mx-4 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {items.map((item, i) => (
              <article
                key={i}
                className="snap-center shrink-0 w-[86%] sm:w-[70%] lg:w-[60%]"
              >
                <div className="h-full border border-border bg-card rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6 md:gap-8 transition-colors hover:border-primary/40">
                  <div className="shrink-0">
                    <TechDemo icon={item.icon} />
                  </div>
                  <div className="text-center sm:text-left">
                    <span className="text-xs font-medium uppercase tracking-wider text-primary tabular-nums">
                      {String(i + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
                    </span>
                    <h3 className="text-xl md:text-2xl font-semibold text-foreground mt-2 mb-3 leading-snug">
                      {pickLocale(item.title, language)}
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                      {pickLocale(item.body, language)}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

        </div>

        {/* Controls — arrows flank the dots so nothing overlaps the cards */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            type="button"
            onClick={() => scrollToIndex(active - 1)}
            disabled={active === 0}
            aria-label="Previous"
            className="w-9 h-9 rounded-full border border-border bg-card flex items-center justify-center text-foreground shadow-sm transition-colors hover:border-primary/50 hover:text-primary disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-5 h-5" aria-hidden />
          </button>

          <div className="flex items-center gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollToIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === active ? "w-6 bg-primary" : "w-2 bg-border hover:bg-primary/40"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => scrollToIndex(active + 1)}
            disabled={active === count - 1}
            aria-label="Next"
            className="w-9 h-9 rounded-full border border-border bg-card flex items-center justify-center text-foreground shadow-sm transition-colors hover:border-primary/50 hover:text-primary disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronRight className="w-5 h-5" aria-hidden />
          </button>
        </div>
      </div>
    </section>
  )
}
