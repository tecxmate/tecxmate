"use client"

import {
  Bot,
  MessageSquare,
  Mic,
  Volume2,
  CreditCard,
  Smartphone,
  ServerCog,
  Cloud,
  type LucideIcon,
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { salesDeck, pickLocale } from "@/lib/sales-deck"

const PILL_ICONS: Record<string, LucideIcon> = {
  bot: Bot,
  "message-square": MessageSquare,
  "credit-card": CreditCard,
  smartphone: Smartphone,
  "server-cog": ServerCog,
  cloud: Cloud,
}

const WAVE_DELAYS = ["0ms", "120ms", "240ms", "360ms", "480ms"]

function Waveform() {
  return (
    <span className="flex items-center gap-[3px] h-6" aria-hidden>
      {WAVE_DELAYS.map((delay) => (
        <span
          key={delay}
          className="w-[3px] h-2 rounded-full bg-primary motion-safe:animate-[deck-wave_1.1s_ease-in-out_infinite]"
          style={{ animationDelay: delay }}
        />
      ))}
    </span>
  )
}

function FlowLine() {
  return (
    <span className="relative flex-1 min-w-6 h-px bg-border mx-1 hidden md:block" aria-hidden>
      <span className="absolute top-1/2 -translate-y-1/2 left-0 w-1.5 h-1.5 rounded-full bg-primary motion-safe:animate-[deck-travel_2.4s_linear_infinite]" />
    </span>
  )
}

export function TechnologySection() {
  const { language } = useLanguage()
  const { technology, visuals } = salesDeck
  const voice = visuals.voice

  const pills = technology.items.filter((item) => item.icon !== "mic")

  return (
    <section id="technology" className="bg-background py-20 md:py-24">
      <div className="container px-4 md:px-6 max-w-6xl">
        <h2 className="text-3xl font-semibold md:text-4xl lg:text-5xl tracking-tight text-foreground mb-3">
          {pickLocale(technology.title, language)}
        </h2>
        <p className="text-muted-foreground mb-14 max-w-2xl">
          {pickLocale(voice.subtitle, language)}
        </p>

        {/* Voice pipeline */}
        <div className="border border-border bg-card rounded-2xl px-6 py-8 md:px-10 md:py-10 mb-10">
          <p className="text-xs font-medium uppercase tracking-wider text-primary mb-8">
            {pickLocale(voice.title, language)}
          </p>
          <div className="flex flex-col md:flex-row md:items-center gap-5 md:gap-0">
            {voice.stages.map((stage, i) => (
              <div key={stage.id} className="contents">
                {i > 0 && <FlowLine />}
                <div className="flex md:flex-col items-center md:items-center gap-3 md:gap-2 md:text-center shrink-0">
                  {stage.id === "in" && <Mic className="w-5 h-5 text-primary" aria-hidden />}
                  {stage.id === "out" && <Volume2 className="w-5 h-5 text-primary" aria-hidden />}
                  {(stage.id === "in" || stage.id === "out") && <Waveform />}
                  {stage.brand && (
                    <span className="rounded-full border border-border px-3.5 py-1.5 text-sm font-medium text-foreground">
                      {stage.brand}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">{pickLocale(stage.label, language)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Capability pills */}
        <div className="flex flex-wrap gap-3">
          {pills.map((item, i) => {
            const Icon = PILL_ICONS[item.icon] ?? Bot
            return (
              <span
                key={i}
                title={pickLocale(item.body, language)}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                <Icon className="w-4 h-4 text-muted-foreground" aria-hidden />
                {pickLocale(item.title, language)}
              </span>
            )
          })}
        </div>
      </div>
    </section>
  )
}
