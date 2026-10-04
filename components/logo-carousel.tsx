"use client"

import Image from "next/image"
import { InfiniteSlider } from "@/components/ui/infinite-slider"
import { useLanguage } from "@/components/language-provider"
import { useSiteContent } from "@/lib/use-site-content"

// Fallback logos + caption, used until live content loads. Mirrors the
// defaults in lib/site-content.ts so the carousel looks the same either way.
const FALLBACK_LOGOS = [
  { name: "Crypted", src: "/logos/crypted.png" },
  { name: "HealthMaxers", src: "/logos/healthmaxers.png" },
  { name: "IPRP Shield", src: "/logos/IPRPSHIELD.png" },
  { name: "CHI CHI Vietnamese", src: "/logos/chichi.png" },
]

export function LogoCarousel() {
  const { language } = useLanguage()
  const content = useSiteContent()
  const config = content?.homepage?.heroLogos

  // Hidden unless an admin has turned it on. `config === undefined` means
  // content hasn't loaded yet — stay hidden rather than flashing the carousel
  // in and out, since the default state is off anyway.
  if (!config?.enabled) return null

  const logos = config.items?.length ? config.items : FALLBACK_LOGOS
  if (logos.length === 0) return null

  const caption = config.caption?.[language] || config.caption?.en || "with partners from"

  return (
    <div className="absolute left-4 md:left-8 right-4 bottom-24 md:bottom-20">
      <div className="flex items-center gap-2 md:gap-4">
        <div className="flex-shrink-0">
          <div className="flex flex-col text-left">
            <span className="text-xs md:text-sm text-gray-600 font-medium max-w-[6rem] leading-tight">
              {caption}
            </span>
          </div>
        </div>
        <div className="h-10 md:h-16 w-0.5 bg-gray-400"></div>
        <InfiniteSlider duration={55} gap={32} className="py-2 md:py-4 flex-1">
          {logos.map((logo, index) => (
            <div
              key={`${logo.src}-${index}`}
              className="flex items-center justify-center h-10 md:h-16 w-auto relative"
            >
              <Image
                src={logo.src}
                alt={logo.name}
                width={400}
                height={160}
                className="h-10 md:h-16 w-auto object-contain transition-all duration-300 hover:scale-110"
                loading="lazy"
                quality={100}
                sizes="(max-width: 768px) 200px, 400px"
              />
            </div>
          ))}
        </InfiniteSlider>
      </div>
    </div>
  )
}
