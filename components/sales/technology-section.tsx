"use client"

import {
  Bot,
  MessageSquare,
  Mic,
  CreditCard,
  Smartphone,
  ServerCog,
  Cloud,
  type LucideIcon,
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { salesDeck, pickLocale } from "@/lib/sales-deck"

const ICON_MAP: Record<string, LucideIcon> = {
  bot: Bot,
  "message-square": MessageSquare,
  mic: Mic,
  "credit-card": CreditCard,
  smartphone: Smartphone,
  "server-cog": ServerCog,
  cloud: Cloud,
}

export function TechnologySection() {
  const { language } = useLanguage()
  const { technology } = salesDeck

  return (
    <section id="technology" className="bg-background py-20 md:py-24">
      <div className="container px-4 md:px-6 max-w-6xl">
        <h2 className="text-3xl font-semibold md:text-4xl lg:text-5xl tracking-tight text-foreground mb-3">
          {pickLocale(technology.title, language)}
        </h2>
        <p className="text-muted-foreground mb-12 md:mb-16 max-w-2xl">
          {pickLocale(technology.subtitle, language)}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {technology.items.map((item, i) => {
            const Icon = ICON_MAP[item.icon] ?? Bot
            return (
              <div
                key={i}
                className="bg-card p-5 md:p-6 border border-border group transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_40px_rgba(139,92,246,0.18)]"
              >
                <div className="w-10 h-10 bg-background flex items-center justify-center mb-3 shadow-sm transition-all duration-200 group-hover:bg-primary/10">
                  <Icon className="w-5 h-5 text-muted-foreground transition-colors duration-200 group-hover:text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {pickLocale(item.title, language)}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {pickLocale(item.body, language)}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
