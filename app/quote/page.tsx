import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { QuoteForm } from "@/components/quote-form"

export const metadata: Metadata = {
  title: "Request a quote | Tecxmate",
  description:
    "Tell us what you need and we will come back with scope, timeline, and a real number. First consultation is free.",
  robots: { index: true, follow: true },
}

export default async function QuotePage({
  searchParams,
}: {
  searchParams: Promise<{ chat?: string }>
}) {
  const { chat } = await searchParams

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
          <QuoteForm conversationId={chat} />
        </div>
      </section>
      <Footer />
    </main>
  )
}
