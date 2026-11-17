"use client"

import { ArrowRight, Check } from "lucide-react"
import ShaderBackground from "@/components/shader-background"
import { LogoCarousel } from "@/components/logo-carousel"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { salesDeck } from "@/lib/sales-deck"

/**
 * The product-first homepage sections. They reuse the hero background, the
 * card style, the team and blog sections; the words and the order are new.
 */

type T = ReturnType<typeof useLanguage>["t"]
type Key = Parameters<T>[0]

type ProductCardData = {
  id: string
  name: string
  sub: Key
  status: Key
  line: Key
  points: Key[]
  link?: { label: Key; href: string; internal?: boolean }
}

const PRODUCTS: ProductCardData[] = [
  {
    id: "tecxmap",
    name: "TECXMAP",
    sub: "ph_tecxmap_sub",
    status: "ph_status_live",
    line: "ph_tecxmap_line",
    points: ["ph_tecxmap_p1", "ph_tecxmap_p2", "ph_tecxmap_p3"],
    link: { label: "ph_tecxmap_link", href: "https://map.tecxmate.com" },
  },
  {
    id: "datatecx",
    name: "DATATECX",
    sub: "ph_datatecx_sub",
    status: "ph_status_pilot",
    line: "ph_datatecx_line",
    points: ["ph_datatecx_p1", "ph_datatecx_p3"],
    link: { label: "ph_datatecx_link", href: salesDeck.bookingUrl },
  },
  {
    id: "alphatecx",
    name: "AlphaTecx",
    sub: "ph_alphatecx_sub",
    status: "ph_status_preview",
    line: "ph_alphatecx_line",
    points: ["ph_alphatecx_p1", "ph_alphatecx_p2"],
    link: { label: "ph_contact_link", href: "/quote?product=alphatecx", internal: true },
  },
  {
    id: "etecx",
    name: "eTecx",
    sub: "ph_etecx_sub",
    status: "ph_status_dev",
    line: "ph_etecx_line",
    points: ["ph_etecx_p1", "ph_etecx_p2"],
    link: { label: "ph_contact_link", href: "/quote?product=etecx", internal: true },
  },
]

export function ProductsHero() {
  const { t } = useLanguage()
  return (
    <ShaderBackground>
      <div className="absolute inset-0 flex flex-col items-start justify-center px-8 md:px-8 pt-20 pb-24 z-10">
        <div className="max-w-xl text-left">
          <h1
            className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold tracking-tight text-gray-900 dark:text-white leading-[1.1] mb-6 [text-shadow:none] dark:[text-shadow:0_2px_18px_rgba(140,82,255,0.45)] md:[text-shadow:0_1px_2px_rgba(255,255,255,0.8)] dark:md:[text-shadow:0_2px_20px_rgba(140,82,255,0.5)]"
            suppressHydrationWarning
          >
            {t("ph_hero_title")}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-200 md:text-gray-700 max-w-md mb-8 leading-relaxed" suppressHydrationWarning>
            {t("ph_hero_subtitle")}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white text-base px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 whitespace-nowrap"
              asChild
            >
              <a href="#products">{t("ph_cta_products")}</a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base px-8 py-6 rounded-full bg-white/70 dark:bg-white/5 whitespace-nowrap"
              asChild
            >
              <a href={salesDeck.bookingUrl} target="_blank" rel="noopener noreferrer">
                {t("ph_cta_call")}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </ShaderBackground>
  )
}

function ProductCard({ product }: { product: ProductCardData }) {
  const { t } = useLanguage()
  return (
    <article className="bg-card border border-border shadow-sm overflow-hidden h-full flex flex-col">
      <div className="aspect-video w-full flex items-center justify-center bg-primary/5 relative">
        <span className="text-3xl md:text-4xl font-bold tracking-tight text-primary/60">{product.name}</span>
        <span className="absolute top-4 left-4 whitespace-nowrap text-xs font-semibold px-2.5 py-1 rounded-full border border-primary/30 bg-background/80 text-primary">
          {t(product.status)}
        </span>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{t(product.sub)}</p>
        <h3 className="text-xl font-bold text-foreground mb-3">{product.name}</h3>
        <p className="text-muted-foreground leading-relaxed mb-5">{t(product.line)}</p>
        <ul className="space-y-2 mb-6 flex-1">
          {product.points.map((key) => (
            <li key={key} className="flex gap-2 text-sm text-foreground">
              <Check className="h-4 w-4 mt-0.5 shrink-0 text-primary" aria-hidden="true" />
              <span>{t(key)}</span>
            </li>
          ))}
        </ul>
        {product.link && (
          <a
            href={product.link.href}
            {...(product.link.internal ? {} : { target: "_blank", rel: "noopener noreferrer" })}
            className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:gap-2 transition-all whitespace-nowrap"
          >
            {t(product.link.label)}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        )}
      </div>
    </article>
  )
}

export function ProductsGrid() {
  const { t } = useLanguage()
  return (
    <section id="products" className="bg-muted py-20 md:py-24 scroll-mt-16">
      <div className="container px-4 md:px-6 max-w-7xl">
        <h2 className="text-3xl font-semibold md:text-4xl tracking-tight text-foreground mb-10">{t("ph_products_title")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}

export function WhySection() {
  const { t } = useLanguage()
  return (
    <section id="why" className="bg-background py-20 md:py-28">
      <div className="container px-4 md:px-6 max-w-4xl">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground mb-6">
          {t("ph_why_title")}
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">{t("ph_why_body")}</p>
      </div>
    </section>
  )
}

export function ClientsSection() {
  const { t } = useLanguage()
  const items: Key[] = ["ph_clients_apps", "ph_clients_ai", "ph_clients_search"]
  return (
    <section id="clients" className="bg-muted/30 py-16 md:py-20">
      <div className="container px-4 md:px-6 max-w-7xl">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground mb-3">{t("ph_clients_title")}</h2>
        <p className="text-muted-foreground mb-6">{t("ph_clients_body")}</p>
        <div className="flex flex-wrap gap-2 mb-8">
          {items.map((key) => (
            <span key={key} className="whitespace-nowrap text-sm px-3 py-1.5 rounded-full border border-border bg-card text-foreground">
              {t(key)}
            </span>
          ))}
        </div>
        <LogoCarousel inline />
      </div>
    </section>
  )
}

export function FinalCta() {
  const { t } = useLanguage()
  return (
    <section id="cta" className="bg-gray-950 py-24 md:py-32">
      <div className="container px-4 md:px-6 max-w-4xl text-center">
        <h2 className="text-4xl font-semibold md:text-5xl lg:text-6xl tracking-tight text-white mb-6">{t("ph_final_title")}</h2>
        <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">{t("ph_final_body")}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white text-base px-8 py-6 rounded-full shadow-lg whitespace-nowrap"
            asChild
          >
            <a href="https://map.tecxmate.com" target="_blank" rel="noopener noreferrer">
              {t("ph_final_map")}
            </a>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-base px-8 py-6 rounded-full bg-transparent text-white border-white/40 hover:bg-white/10 hover:text-white whitespace-nowrap"
            asChild
          >
            <a href={salesDeck.bookingUrl} target="_blank" rel="noopener noreferrer">
              {t("ph_cta_call")}
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
