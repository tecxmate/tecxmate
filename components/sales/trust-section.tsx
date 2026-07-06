"use client"

import { useLanguage } from "@/components/language-provider"
import { salesDeck, pickLocale } from "@/lib/sales-deck"

export function TrustSection() {
  const { language } = useLanguage()
  const { trust } = salesDeck

  return (
    <section id="trust" className="bg-background py-20 md:py-24">
      <div className="container px-4 md:px-6 max-w-6xl">
        <h2 className="text-3xl font-semibold md:text-4xl lg:text-5xl tracking-tight text-foreground mb-12 md:mb-16">
          {pickLocale(trust.title, language)}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
          {trust.items.map((item, i) => (
            <div key={i}>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {pickLocale(item.title, language)}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {pickLocale(item.body, language)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
