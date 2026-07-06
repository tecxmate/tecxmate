"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowDown, ArrowUp, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { salesDeck, pickLocale, type SalesOffering } from "@/lib/sales-deck"
import type { Locale } from "@/lib/site-content"

const SLIDE_COUNT = 8 + salesDeck.proof.offerings.length

function OfferingSlide({ cs, language }: { cs: SalesOffering; language: Locale }) {
  return (
    <div className="max-w-4xl">
      <span className="text-xs font-medium uppercase tracking-wider text-primary">
        {pickLocale(cs.tag, language)}
      </span>
      <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-foreground mt-3 mb-6">
        {pickLocale(cs.title, language)}
      </h2>
      <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-3">
        {pickLocale(cs.problem, language)}
      </p>
      <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-3">
        {pickLocale(cs.solution, language)}
      </p>
      <p className="text-sm md:text-base text-foreground leading-relaxed mb-8">
        {pickLocale(cs.outcome, language)}
      </p>
      <div className="flex flex-wrap items-end gap-10 border-t border-border pt-6">
        {cs.metrics.map((m, i) => (
          <div key={i}>
            <p className="text-2xl md:text-4xl font-semibold text-primary">
              {pickLocale(m.value, language)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{pickLocale(m.label, language)}</p>
          </div>
        ))}
        <div className="flex flex-wrap gap-2 ml-auto">
          {cs.stack.map((tech) => (
            <span key={tech} className="text-xs px-2.5 py-1 border border-border text-muted-foreground">
              {tech}
            </span>
          ))}
        </div>
      </div>
      {cs.disclaimer && (
        <p className="text-xs text-muted-foreground/70 mt-4">{pickLocale(cs.disclaimer, language)}</p>
      )}
    </div>
  )
}

export function DeckViewer() {
  const { language } = useLanguage()
  const containerRef = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(0)

  const goTo = useCallback((index: number) => {
    const container = containerRef.current
    if (!container) return
    const clamped = Math.max(0, Math.min(SLIDE_COUNT - 1, index))
    container.children[clamped]?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const slides = Array.from(container.children)
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setCurrent(slides.indexOf(entry.target))
        }
      },
      { root: container, threshold: 0.6 },
    )
    slides.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  // Keep a ref in sync so the keydown handler reads the latest slide index.
  const currentRef = useRef(current)
  useEffect(() => {
    currentRef.current = current
  }, [current])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault()
        goTo(currentRef.current + 1)
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault()
        goTo(currentRef.current - 1)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [goTo])

  const { cover, problem, economics, proof, trust, process, cta } = salesDeck
  const snh = economics.serviceNotHire
  const slideClass =
    "min-h-[100dvh] snap-start flex items-center px-6 md:px-16 lg:px-24 py-20"

  return (
    <div className="relative bg-background">
      {/* Chrome */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-16 lg:px-24 py-4">
        <Link href="/" className="text-2xl font-accent italic tracking-wide text-primary">
          <span className="font-thin">tecxmate</span>
        </Link>
        <span className="text-xs font-mono text-muted-foreground">
          {current + 1} / {SLIDE_COUNT}
        </span>
      </header>

      {/* Dots */}
      <nav
        aria-label="Slides"
        className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-50 hidden sm:flex flex-col gap-2"
      >
        {Array.from({ length: SLIDE_COUNT }, (_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              i === current ? "bg-primary scale-125" : "bg-border hover:bg-muted-foreground"
            }`}
          />
        ))}
      </nav>

      {/* Prev / next */}
      <div className="fixed bottom-6 right-6 z-50 flex gap-2">
        <Button variant="outline" size="icon" onClick={() => goTo(current - 1)} aria-label="Previous slide">
          <ArrowUp className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => goTo(current + 1)} aria-label="Next slide">
          <ArrowDown className="w-4 h-4" />
        </Button>
      </div>

      <div ref={containerRef} className="h-[100dvh] overflow-y-auto snap-y snap-mandatory">
        {/* 1 — Cover */}
        <section className={slideClass}>
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-foreground leading-[1.05] mb-6">
              {pickLocale(cover.title, language)}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8">
              {pickLocale(cover.subtitle, language)}
            </p>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground mb-10">
              {cover.credibility.map((c, i) => (
                <li key={i}>{pickLocale(c, language)}</li>
              ))}
            </ul>
            <Button size="lg" className="rounded-full px-8" asChild>
              <a href={salesDeck.bookingUrl} target="_blank" rel="noopener noreferrer">
                {pickLocale(cta.button, language)}
              </a>
            </Button>
            <p className="text-xs text-muted-foreground mt-12">{cover.footer}</p>
          </div>
        </section>

        {/* 2 — Problem */}
        <section className={slideClass}>
          <div className="max-w-5xl">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-foreground mb-10">
              {pickLocale(problem.title, language)}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {problem.points.map((point, i) => (
                <div key={i} className="border border-border p-6">
                  <span className="text-sm font-mono text-primary">0{i + 1}</span>
                  <h3 className="font-semibold text-foreground mt-3 mb-2">
                    {pickLocale(point.title, language)}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {pickLocale(point.body, language)}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-lg md:text-xl text-foreground">{pickLocale(problem.close, language)}</p>
          </div>
        </section>

        {/* 3 — Reframe */}
        <section className={slideClass}>
          <div className="max-w-4xl border-l-4 border-primary pl-6 md:pl-10">
            <p className="text-lg md:text-2xl text-muted-foreground leading-relaxed mb-6">
              {pickLocale(problem.reframe, language)}
            </p>
            <p className="text-2xl md:text-4xl font-semibold text-foreground leading-snug">
              {pickLocale(problem.reframeStatement, language)}
            </p>
          </div>
        </section>

        {/* 4 — Economics */}
        <section className={slideClass}>
          <div className="max-w-5xl w-full">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-foreground mb-3">
              {pickLocale(economics.title, language)}
            </h2>
            <p className="text-sm text-muted-foreground mb-8">
              {pickLocale(economics.caption, language)}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-sm md:text-base">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-3 pr-4" />
                    <th className="py-3 px-4 text-left font-semibold text-muted-foreground">
                      {pickLocale(economics.columns.inHouse, language)}
                    </th>
                    <th className="py-3 px-4 text-left font-semibold text-primary bg-primary/5">
                      {pickLocale(economics.columns.tecxmate, language)}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {economics.rows.map((row, i) => (
                    <tr key={i} className="border-b border-border">
                      <td className="py-4 pr-4 font-medium text-foreground align-top">
                        {pickLocale(row.dimension, language)}
                      </td>
                      <td className="py-4 px-4 text-muted-foreground align-top">
                        {pickLocale(row.inHouse, language)}
                      </td>
                      <td className="py-4 px-4 text-foreground font-medium align-top bg-primary/5">
                        {pickLocale(row.tecxmate, language)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 5 — A service, not a hire */}
        <section className={slideClass}>
          <div className="max-w-5xl w-full">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-foreground mb-10">
              {pickLocale(snh.title, language)}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="border border-border p-6">
                <h3 className="font-semibold text-muted-foreground mb-4">
                  {pickLocale(snh.leftTitle, language)}
                </h3>
                <ul className="space-y-2.5">
                  {snh.leftItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <X className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground/60" />
                      {pickLocale(item, language)}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border border-primary/40 p-6">
                <h3 className="font-semibold text-foreground mb-4">
                  {pickLocale(snh.rightTitle, language)}
                </h3>
                <ul className="space-y-2.5">
                  {snh.rightItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                      <Check className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                      {pickLocale(item, language)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="text-lg md:text-xl font-medium text-foreground">
              {pickLocale(snh.close, language)}
            </p>
          </div>
        </section>

        {/* Offerings — one slide each */}
        {proof.offerings.map((cs) => (
          <section key={cs.id} className={slideClass}>
            <OfferingSlide cs={cs} language={language} />
          </section>
        ))}

        {/* 8 — Trust */}
        <section className={slideClass}>
          <div className="max-w-5xl">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-foreground mb-10">
              {pickLocale(trust.title, language)}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8">
              {trust.items.map((item, i) => (
                <div key={i}>
                  <h3 className="font-semibold text-foreground mb-1.5">
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

        {/* 9 — Process */}
        <section className={slideClass}>
          <div className="max-w-5xl w-full">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-foreground mb-10">
              {pickLocale(process.title, language)}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {process.steps.map((step, i) => (
                <div key={i} className="border border-border p-5">
                  <span className="text-sm font-mono text-primary">0{i + 1}</span>
                  <h3 className="font-semibold text-foreground mt-2 mb-1.5">
                    {pickLocale(step.title, language)}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {pickLocale(step.body, language)}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex flex-col md:flex-row gap-6">
              {process.engagements.map((e, i) => (
                <div key={i} className="border-l-2 border-primary pl-4">
                  <p className="font-semibold text-foreground text-sm">{pickLocale(e.title, language)}</p>
                  <p className="text-sm text-muted-foreground">{pickLocale(e.body, language)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 10 — CTA */}
        <section className={`${slideClass} bg-gray-950`}>
          <div className="max-w-4xl">
            <h2 className="text-4xl md:text-6xl font-semibold tracking-tight text-white mb-6">
              {pickLocale(cta.title, language)}
            </h2>
            <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl">
              {pickLocale(cta.body, language)}
            </p>
            <Button size="lg" className="rounded-full px-8" asChild>
              <a href={salesDeck.bookingUrl} target="_blank" rel="noopener noreferrer">
                {pickLocale(cta.button, language)}
              </a>
            </Button>
            <p className="text-xs text-gray-500 mt-16">
              official@tecxmate.com · www.tecxmate.com · TECXMATE COMPANY LIMITED
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
