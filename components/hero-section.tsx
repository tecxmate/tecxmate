"use client"

import { useEffect, useState } from "react"
import ShaderBackground from "@/components/shader-background"
import { LogoCarousel } from "@/components/logo-carousel"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import type { SiteContent } from "@/lib/site-content"

export function HeroSection() {
  const { t, language } = useLanguage()
  const [hero, setHero] = useState<SiteContent["hero"] | null>(null)

  useEffect(() => {
    fetch("/api/content", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((c) => {
        if (c?.hero) setHero(c.hero)
      })
      .catch(() => {})
  }, [])

  // Before the live content arrives, fall back to the i18n dictionary (which mirrors the defaults).
  const title = hero ? hero.title[language] || hero.title.en : t("hero_title")
  const subtitle = hero ? hero.subtitle[language] || hero.subtitle.en : t("hero_subtitle")

  return (
    <ShaderBackground>
      <div className="absolute inset-0 flex flex-col items-start justify-center px-8 md:px-8 pt-20 pb-24 z-10">
        <div className="max-w-xl text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold tracking-tight text-primary dark:text-white md:text-gray-900 dark:md:text-white leading-[1.1] mb-6 text-left [text-shadow:none] dark:[text-shadow:0_2px_18px_rgba(140,82,255,0.45)] md:[text-shadow:0_1px_2px_rgba(255,255,255,0.8)] dark:md:[text-shadow:0_2px_20px_rgba(140,82,255,0.5)]" suppressHydrationWarning>
            {title}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-200 md:text-gray-700 dark:md:text-gray-200 max-w-md mb-8 leading-relaxed text-left [text-shadow:none]">
            {subtitle}
          </p>
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white text-base px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 self-start"
            asChild
          >
          <a href="https://cal.com/nikolasdoan/30min" target="_blank" rel="noopener noreferrer">
              {t("book_call")}
            </a>
          </Button>
        </div>
      </div>
      {/* <LogoCarousel /> */}
    </ShaderBackground>
  )
}
