"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { salesDeck, pickLocale } from "@/lib/sales-deck"
import { useSiteContent } from "@/lib/use-site-content"

export function CtaSection() {
  const { language } = useLanguage()
  const content = useSiteContent()
  const override = content?.homepage?.cta

  // Prefer admin-edited copy; fall back to the static sales deck until content
  // loads (or if a field was left blank).
  const title = override?.title?.[language] || override?.title?.en || pickLocale(salesDeck.cta.title, language)
  const body = override?.body?.[language] || override?.body?.en || pickLocale(salesDeck.cta.body, language)
  const buttonLabel =
    override?.buttonLabel?.[language] || override?.buttonLabel?.en || pickLocale(salesDeck.cta.button, language)
  const url = override?.url?.trim() || salesDeck.bookingUrl

  return (
    <section id="cta" className="bg-gray-950 py-24 md:py-32">
      <div className="container px-4 md:px-6 max-w-4xl text-center">
        <h2 className="text-4xl font-semibold md:text-5xl lg:text-6xl tracking-tight text-white mb-6">
          {title}
        </h2>
        <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
          {body}
        </p>
        <Button
          size="lg"
          className="bg-primary hover:bg-primary/90 text-white text-base px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
          asChild
        >
          <a href={url} target="_blank" rel="noopener noreferrer">
            {buttonLabel}
          </a>
        </Button>
      </div>
    </section>
  )
}
