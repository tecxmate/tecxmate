"use client"

import {
  UserCheck,
  Languages,
  Clock,
  Building2,
  ShieldCheck,
  HandCoins,
  type LucideIcon,
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { salesDeck, pickLocale } from "@/lib/sales-deck"

const ICONS: LucideIcon[] = [UserCheck, Languages, Clock, Building2, ShieldCheck, HandCoins]

export function TrustSection() {
  const { language } = useLanguage()
  const { trust } = salesDeck

  return (
    <section id="trust" className="bg-background py-16 md:py-20">
      <div className="container px-4 md:px-6 max-w-6xl">
        <h2 className="text-2xl font-semibold md:text-3xl tracking-tight text-foreground mb-10 md:mb-12">
          {pickLocale(trust.title, language)}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-7">
          {trust.items.map((item, i) => {
            const Icon = ICONS[i] ?? UserCheck
            return (
              <div key={i} className="flex items-start gap-3.5">
                <Icon className="w-5 h-5 text-primary mt-0.5 shrink-0" aria-hidden />
                <div>
                  <h3 className="font-semibold text-foreground text-sm mb-0.5">
                    {pickLocale(item.title, language)}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {pickLocale(item.body, language)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
