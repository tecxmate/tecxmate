import Link from "next/link"
import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { readIndex } from "@/lib/tecxbook"

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tecxmate.com"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Tecxbook — Interactive HTML Artifacts | Tecxmate",
  description:
    "A growing library of interactive HTML artifacts — visual essays, maps, and references you can open in your browser.",
  alternates: { canonical: `${baseUrl}/tecxbook` },
  openGraph: {
    title: "Tecxbook — Interactive HTML Artifacts",
    description:
      "A growing library of interactive HTML artifacts — visual essays, maps, and references.",
    url: `${baseUrl}/tecxbook`,
    siteName: "Tecxmate",
    type: "website",
  },
}

export default async function TecxbookPage() {
  const entries = await readIndex()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="bg-primary/5 dark:bg-primary/10 py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-3xl font-semibold md:text-4xl lg:text-5xl mb-6 text-foreground">
                Tecxbook
              </h1>
              <p className="mt-4 text-muted-foreground md:text-xl/relaxed">
                A library of interactive HTML artifacts — open any page like an image.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container px-4 md:px-6">
            {entries.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No artifacts yet — check back soon.
              </p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {entries.map((entry) => (
                  <Link
                    key={entry.slug}
                    href={`/tecxbook/${entry.slug}`}
                    className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      {entry.cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={entry.cover}
                          alt={entry.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/30">
                          <span className="font-accent italic text-3xl text-primary/70">
                            tecxbook
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h2 className="text-lg font-semibold text-foreground group-hover:text-primary">
                        {entry.title}
                      </h2>
                      <p className="mt-2 flex-1 text-sm text-muted-foreground">
                        {entry.description}
                      </p>
                      {entry.tags && entry.tags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {entry.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
