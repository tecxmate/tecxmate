"use client"

import ShaderBackground from "@/components/shader-background"
import { LogoCarousel } from "@/components/logo-carousel"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"

export function HeroSection() {
  const { t } = useLanguage()

  return (
    <ShaderBackground>
      <div className="absolute inset-0 flex flex-col items-start justify-center px-4 md:px-8 pt-20 pb-24 z-10">
        <div className="bg-transparent border-0 shadow-none rounded-none backdrop-blur-0 px-0 py-0 pl-6 md:pl-0 md:px-12 md:py-12 max-w-xl text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold tracking-tight text-gray-900 leading-[1.1] mb-6 text-left [text-shadow:0_1px_2px_rgba(255,255,255,0.8)] md:[text-shadow:none]">
            {t("hero_title")}
          </h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-lg mb-8 leading-relaxed text-left md:text-gray-600">
            {t("hero_subtitle")}
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
      <LogoCarousel />
    </ShaderBackground>
  )
}
