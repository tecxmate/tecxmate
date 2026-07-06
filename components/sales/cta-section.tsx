"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { salesDeck, pickLocale } from "@/lib/sales-deck"

export function CtaSection() {
  const { language } = useLanguage()
  const { cta, visuals } = salesDeck
  const offer = visuals.freeOffer

  return (
    <section id="cta" className="bg-gray-950 py-24 md:py-32">
      <div className="container px-4 md:px-6 max-w-4xl text-center">
        <h2 className="text-4xl font-semibold md:text-5xl lg:text-6xl tracking-tight text-white mb-6">
          {pickLocale(cta.title, language)}
        </h2>
        <p className="text-lg md:text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
          {pickLocale(cta.body, language)}
        </p>
        <p className="text-sm md:text-base text-gray-300 mb-10 max-w-2xl mx-auto">
          <span className="inline-block align-middle bg-primary text-white text-xs font-semibold uppercase tracking-wider rounded-full px-2.5 py-1 mr-2.5">
            {pickLocale(offer.badge, language)}
          </span>
          {pickLocale(offer.text, language)}
        </p>
        <Button
          size="lg"
          className="bg-primary hover:bg-primary/90 text-white text-base px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
          asChild
        >
          <a href={salesDeck.bookingUrl} target="_blank" rel="noopener noreferrer">
            {pickLocale(cta.button, language)}
          </a>
        </Button>
      </div>
    </section>
  )
}
