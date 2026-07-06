"use client"

import { useEffect, useRef, useState } from "react"
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

const DEMO_DURATION_MS = 3600

export function EconomicsSection() {
  const { language } = useLanguage()
  const calc = salesDeck.visuals.calculator
  const cur = calc.currencies[language]
  const [salary, setSalary] = useState(cur.default)
  const sectionRef = useRef<HTMLElement>(null)
  const curRef = useRef(cur)
  curRef.current = cur
  const demoRef = useRef({ raf: 0, active: false, played: false })

  const stopDemo = () => {
    if (demoRef.current.active) {
      cancelAnimationFrame(demoRef.current.raf)
      demoRef.current.active = false
    }
  }

  // Auto-sweep the slider once when the section first scrolls into view,
  // so visitors see the comparison move before touching anything.
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || demoRef.current.played) return
        demoRef.current.played = true
        io.disconnect()
        const start = performance.now()
        demoRef.current.active = true
        const tick = (now: number) => {
          if (!demoRef.current.active) return
          const c = curRef.current
          const t = Math.min((now - start) / DEMO_DURATION_MS, 1)
          // Sweep toward the top of the range and settle back on the default.
          const wave = Math.sin(Math.PI * t)
          const eased = wave * wave * (3 - 2 * wave)
          const peak = c.min + (c.max - c.min) * 0.85
          const v = c.default + (peak - c.default) * eased
          setSalary(Math.round(v / c.step) * c.step)
          if (t < 1) {
            demoRef.current.raf = requestAnimationFrame(tick)
          } else {
            demoRef.current.active = false
          }
        }
        demoRef.current.raf = requestAnimationFrame(tick)
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      stopDemo()
    }
  }, [])

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
                  stopDemo()
                  setSalary(v)
                }}
                onPointerDown={stopDemo}
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
