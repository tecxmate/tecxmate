"use client"

import { Check, X } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { salesDeck, pickLocale } from "@/lib/sales-deck"

export function EconomicsSection() {
  const { language } = useLanguage()
  const { economics } = salesDeck
  const snh = economics.serviceNotHire

  return (
    <section id="economics" className="bg-background py-20 md:py-24">
      <div className="container px-4 md:px-6 max-w-6xl">
        <h2 className="text-3xl font-semibold md:text-4xl lg:text-5xl tracking-tight text-foreground mb-4">
          {pickLocale(economics.title, language)}
        </h2>
        <p className="text-sm text-muted-foreground mb-10 md:mb-12">
          {pickLocale(economics.caption, language)}
        </p>

        <div className="overflow-x-auto mb-20">
          <table className="w-full min-w-[640px] border-collapse text-sm md:text-base">
            <thead>
              <tr className="border-b border-border">
                <th className="py-4 pr-4 text-left font-medium text-muted-foreground w-1/4" />
                <th className="py-4 px-4 text-left font-semibold text-muted-foreground">
                  {pickLocale(economics.columns.inHouse, language)}
                </th>
                <th className="py-4 px-4 text-left font-semibold text-primary bg-primary/5">
                  {pickLocale(economics.columns.tecxmate, language)}
                </th>
              </tr>
            </thead>
            <tbody>
              {economics.rows.map((row, i) => (
                <tr key={i} className="border-b border-border">
                  <td className="py-5 pr-4 font-medium text-foreground align-top">
                    {pickLocale(row.dimension, language)}
                  </td>
                  <td className="py-5 px-4 text-muted-foreground align-top">
                    {pickLocale(row.inHouse, language)}
                  </td>
                  <td className="py-5 px-4 text-foreground font-medium align-top bg-primary/5">
                    {pickLocale(row.tecxmate, language)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="text-2xl font-semibold md:text-3xl tracking-tight text-foreground mb-8 md:mb-10">
          {pickLocale(snh.title, language)}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-card p-6 md:p-8 border border-border">
            <h4 className="font-semibold text-muted-foreground mb-5">
              {pickLocale(snh.leftTitle, language)}
            </h4>
            <ul className="space-y-3">
              {snh.leftItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <X className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground/60" />
                  {pickLocale(item, language)}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-card p-6 md:p-8 border border-primary/40 shadow-[0_0_40px_rgba(139,92,246,0.12)]">
            <h4 className="font-semibold text-foreground mb-5">
              {pickLocale(snh.rightTitle, language)}
            </h4>
            <ul className="space-y-3">
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
  )
}
