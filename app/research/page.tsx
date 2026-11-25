import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ResearchContent } from "@/components/research-content"
import type { Metadata } from "next"

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tecxmate.com"
const description =
  "Studies and findings from every TECXMATE project, each with its sources. Every study also lives on its own project's site."

export const metadata: Metadata = {
  title: "Research",
  description,
  alternates: { canonical: `${baseUrl}/research` },
  openGraph: {
    title: "Research at TECXMATE",
    description,
    url: `${baseUrl}/research`,
    siteName: "Tecxmate",
    type: "website",
    images: [{ url: `${baseUrl}/graphics/tecxmate-logo-cropped.png`, alt: "TECXMATE" }],
  },
}

export default function ResearchPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <ResearchContent />
      </main>
      <Footer />
    </div>
  )
}
