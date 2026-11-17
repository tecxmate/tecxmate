import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { QuoteForm } from "@/components/quote-form"
import { PRODUCT_OPTIONS } from "@/lib/quote"

export const metadata: Metadata = {
  title: "Request a quote | Tecxmate",
  description:
    "Tell us what you need and we will come back with scope, timeline, and a real number. First consultation is free.",
  robots: { index: true, follow: true },
}

export default async function QuotePage({
  searchParams,
}: {
  searchParams: Promise<{ chat?: string; product?: string }>
}) {
  const { chat, product } = await searchParams
  // ?product=alphatecx preselects that product in the form; anything else is ignored.
  const preselected = PRODUCT_OPTIONS.find((id) => id === product)

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="container mx-auto max-w-2xl px-4 pb-24 pt-28 md:px-6 md:pt-32">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl lg:text-5xl">
          Tell us what you need
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
          A few questions, about a minute. We come back with scope, timeline, and a real
          number — and the first consultation is free.
        </p>
        <div className="mt-10">
          <QuoteForm conversationId={chat} product={preselected} />
        </div>
        <div className="mt-12 border-t border-border pt-8">
          <h2 className="text-lg font-semibold text-foreground">Or reach us directly</h2>
          <ul className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <li>
              <a href="https://cal.com/nikolasdoan/30min" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline whitespace-nowrap">
                Book a 30-min call
              </a>
            </li>
            <li>
              Email:{" "}
              <a href="mailto:official@tecxmate.com" className="font-medium text-primary hover:underline">
                official@tecxmate.com
              </a>
            </li>
            <li>
              <a href="https://lin.ee/PHAOtCo" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline whitespace-nowrap">
                Chat on LINE
              </a>
            </li>
            <li>
              <a href="https://wa.me/886966860602" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline whitespace-nowrap">
                Message on WhatsApp
              </a>
            </li>
            <li>
              WeChat ID: <span className="font-medium text-foreground select-all">nikolasdoan</span>
            </li>
          </ul>
        </div>
      </section>
      <Footer />
    </main>
  )
}
