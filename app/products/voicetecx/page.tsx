import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { VoiceTecxContent, VoiceTecxResults } from "@/components/voicetecx-content"
import { ProductSpecPage } from "@/components/product-spec-page"
import { productSpec } from "@/lib/product-specs"
import type { Metadata } from "next"

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tecxmate.com"
const description =
  "VoiceTecx: on-device dictation for the Mac, built for Taiwan Mandarin, English and Traditional Chinese. Your voice and text never leave your Mac."

// Niko's tagline (tecxmate/voicetecx NOTES-FOR-CLOUD.md, 59d34d0).
const title = "VoiceTecx – Private Voice Typing and Transcription"

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${baseUrl}/products/voicetecx` },
  openGraph: {
    title,
    description,
    url: `${baseUrl}/products/voicetecx`,
    siteName: "Tecxmate",
    type: "website",
    images: [{ url: `${baseUrl}/graphics/tecxmate-logo-cropped.png`, alt: "TECXMATE" }],
  },
}

export default function VoiceTecxPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Niko, 2026-11-26: the spec sheet on top, like every product page, with the test results right after its hero (Niko); the selling sections below. */}
        <ProductSpecPage spec={productSpec("voicetecx")!} afterHero={<VoiceTecxResults />} />
        <VoiceTecxContent />
      </main>
      <Footer />
    </div>
  )
}
