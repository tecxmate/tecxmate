"use client"

import { useLanguage } from "@/components/language-provider"
import type { Localized, SiteContent } from "@/lib/site-content"

// Receives server-read content as a prop so the prose is server-rendered (SEO),
// then this client component reacts to the language toggle without a refetch.
export function AboutContent({ about }: { about: SiteContent["about"] }) {
  const { language } = useLanguage()
  const tx = (value: Localized) => value[language] || value.en

  return (
    <>
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">
              About TECXMATE
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl/relaxed" suppressHydrationWarning>
              {tx(about.subtitle)}
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-6 max-w-4xl">
          <div className="prose prose-lg max-w-none">
            {about.sections.map((s) => (
              <div key={s.id} className="mb-8">
                <h2 className="text-2xl font-semibold mb-4" suppressHydrationWarning>
                  {tx(s.heading)}
                </h2>
                {s.paragraphs.map((p, i) => (
                  <p key={i} className="text-muted-foreground leading-relaxed mb-4" suppressHydrationWarning>
                    {tx(p)}
                  </p>
                ))}
                {s.bullets.length > 0 && (
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    {s.bullets.map((b, i) => (
                      <li key={i} suppressHydrationWarning>
                        {tx(b)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
