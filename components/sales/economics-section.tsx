"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Slider } from "@/components/ui/slider"
import { useLanguage } from "@/components/language-provider"
import { salesDeck, pickLocale } from "@/lib/sales-deck"

// Neutral ramp for the in-house stack (identity carried by the legend + tooltips),
// brand purple reserved for the Tecxmate bar. Order: baseline (largest) → top.
const SEGMENT_CLASSES = [
  "bg-zinc-700 dark:bg-zinc-300",
  "bg-zinc-500 dark:bg-zinc-400",
  "bg-zinc-400 dark:bg-zinc-500",
  "bg-zinc-300 dark:bg-zinc-600",
]

export function EconomicsSection() {
  const { language } = useLanguage()
  const calc = salesDeck.visuals.calculator
  const cur = calc.currencies[language]
  const [salary, setSalary] = useState(cur.default)
  const sectionRef = useRef<HTMLElement>(null)
  const curRef = useRef(cur)
  curRef.current = cur
  const manualRef = useRef(false)

  // Once the visitor drags the slider, they take over — stop the scroll drive.
  const takeControl = () => {
    manualRef.current = true
  }

  // Salary derived from the section's position in the viewport: rises to the max
  // as it reaches the middle of the screen, falls back to the min as it leaves.
  const scrollValue = useCallback(() => {
    const el = sectionRef.current
    if (!el) return null
    const c = curRef.current
    const rect = el.getBoundingClientRect()
    const vh = window.innerHeight || 1
    const centerY = rect.top + rect.height / 2
    const p = Math.min(Math.max(1 - centerY / vh, 0), 1) // 0 entering → 0.5 centered → 1 leaving
    const wave = Math.sin(Math.PI * p) // 0 at the edges, 1 at the center
    return Math.round((c.min + (c.max - c.min) * wave) / c.step) * c.step
  }, [])

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let raf = 0
    const update = () => {
      raf = 0
      if (manualRef.current) return
      const v = scrollValue()
      if (v !== null) setSalary(v)
    }
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(update)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    onScroll()
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [scrollValue])

  // Re-map to the new currency scale when the language changes.
  useEffect(() => {
    if (manualRef.current) return
    const v = scrollValue()
    if (v !== null) setSalary(v)
  }, [cur, scrollValue])

  // Keep the slider value sane when the language (and currency range) changes.
  const clamped = Math.min(Math.max(salary, cur.min), cur.max)

  const totalMultiplier = calc.segments.reduce((sum, s) => sum + s.multiplier, 0)
  const inHouse = clamped * totalMultiplier
  const tecxmate = inHouse * calc.tecxmateRatio
  const savings = inHouse - tecxmate
  const savingsPct = Math.round((1 - calc.tecxmateRatio) * 100)

  // Bars scale against the slider maximum so dragging visibly grows/shrinks them.
  const inHouseHeight = (clamped / cur.max) * 100
  const tecxmateHeight = inHouseHeight * calc.tecxmateRatio

  const fmt = new Intl.NumberFormat(cur.locale, {
    style: "currency",
    currency: cur.currency,
    maximumFractionDigits: 0,
  })

  return (
    <section ref={sectionRef} id="economics" className="bg-background py-20 md:py-24">
      <div className="container px-4 md:px-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Controls */}
          <div>
            <h2 className="text-3xl font-semibold md:text-4xl lg:text-5xl tracking-tight text-foreground mb-3">
              {pickLocale(calc.title, language)}
            </h2>
            <p className="text-sm text-muted-foreground mb-10">{pickLocale(calc.caption, language)}</p>

            <label className="block text-sm font-medium text-foreground mb-4">
              {pickLocale(calc.sliderLabel, language)}
            </label>
            <div className="flex items-center gap-5 mb-10">
              <Slider
                value={[clamped]}
                min={cur.min}
                max={cur.max}
                step={cur.step}
                onValueChange={([v]) => {
                  takeControl()
                  setSalary(v)
                }}
                onPointerDown={takeControl}
                aria-label={pickLocale(calc.sliderLabel, language)}
                className="flex-1"
              />
              <span className="text-lg font-semibold text-foreground tabular-nums w-32 text-right shrink-0">
                {fmt.format(clamped)}
              </span>
            </div>

            {/* Legend for the in-house stack */}
            <ul className="space-y-2.5">
              {calc.segments.map((seg, i) => (
                <li key={seg.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2.5 text-muted-foreground">
                    <span className={`w-2.5 h-2.5 rounded-[2px] shrink-0 ${SEGMENT_CLASSES[i]}`} />
                    {pickLocale(seg.label, language)}
                  </span>
                  <span className="tabular-nums text-foreground">
                    {fmt.format(clamped * seg.multiplier)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Chart */}
          <div>
            <div className="text-center mb-8">
              <p className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground tabular-nums">
                {fmt.format(savings)}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                <span className="inline-block bg-primary/10 text-primary font-semibold rounded-full px-2.5 py-0.5 mr-2">
                  −{savingsPct}%
                </span>
                {pickLocale(calc.savingsLabel, language)}
              </p>
            </div>

            <div className="flex items-end justify-center gap-12 md:gap-16 h-72">
              {/* In-house stacked bar */}
              <div className="flex flex-col items-center h-full justify-end w-24 md:w-28">
                <span className="text-sm font-semibold text-foreground tabular-nums mb-2">
                  {fmt.format(inHouse)}
                </span>
                <div
                  className="w-full flex flex-col-reverse gap-[2px] transition-[height] duration-300 ease-out"
                  style={{ height: `${inHouseHeight}%` }}
                  role="img"
                  aria-label={`${pickLocale(calc.inHouseLabel, language)}: ${fmt.format(inHouse)} ${pickLocale(calc.perYear, language)}`}
                >
                  {calc.segments.map((seg, i) => (
                    <div
                      key={seg.id}
                      className={`w-full ${SEGMENT_CLASSES[i]} ${i === calc.segments.length - 1 ? "rounded-t-[4px]" : ""}`}
                      style={{ flexGrow: seg.multiplier }}
                      title={`${pickLocale(seg.label, language)}: ${fmt.format(clamped * seg.multiplier)}`}
                    />
                  ))}
                </div>
              </div>

              {/* Tecxmate bar */}
              <div className="flex flex-col items-center h-full justify-end w-24 md:w-28">
                <span className="text-sm font-semibold text-foreground tabular-nums mb-2">
                  {fmt.format(tecxmate)}
                </span>
                <div
                  className="w-full bg-primary rounded-t-[4px] transition-[height] duration-300 ease-out"
                  style={{ height: `${tecxmateHeight}%` }}
                  role="img"
                  aria-label={`${pickLocale(calc.tecxmateLabel, language)}: ${fmt.format(tecxmate)} ${pickLocale(calc.perYear, language)}`}
                />
              </div>
            </div>

            <div className="flex justify-center gap-12 md:gap-16 border-t border-border pt-3 mt-[2px]">
              <span className="w-24 md:w-28 text-center text-sm text-muted-foreground">
                {pickLocale(calc.inHouseLabel, language)}
              </span>
              <span className="w-24 md:w-28 text-center text-sm font-medium text-foreground">
                {pickLocale(calc.tecxmateLabel, language)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
