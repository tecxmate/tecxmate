import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ArrowLeft } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { TecxbookViewer } from "@/components/tecxbook-viewer"
import { getEntry } from "@/lib/tecxbook"

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tecxmate.com"

export const revalidate = 60

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const entry = await getEntry(slug)
  if (!entry) return {}
  return {
    title: `${entry.title} | Tecxbook`,
    description: entry.description,
    alternates: { canonical: `${baseUrl}/tecxbook/${entry.slug}` },
    openGraph: {
      title: entry.title,
      description: entry.description,
      url: `${baseUrl}/tecxbook/${entry.slug}`,
      siteName: "Tecxmate",
      type: "article",
    },
  }
}

export default async function TecxbookEntryPage({ params }: Params) {
  const { slug } = await params
  const entry = await getEntry(slug)
  if (!entry) notFound()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container px-4 md:px-6 py-8 md:py-12">
        <div className="mb-6">
          <Link
            href="/tecxbook"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Tecxbook
          </Link>
        </div>

        <header className="mb-6">
          <h1 className="text-2xl font-semibold md:text-3xl text-foreground">
            {entry.title}
          </h1>
          <p className="mt-2 text-muted-foreground">{entry.description}</p>
        </header>

        <TecxbookViewer file={entry.file} title={entry.title} />
      </main>
      <Footer />
    </div>
  )
}
