import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { VoiceTecxContent } from "@/components/voicetecx-content"
import { ProductSpecPage } from "@/components/product-spec-page"
import { productSpec } from "@/lib/product-specs"
import type { Metadata } from "next"

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tecxmate.com"
const description =
  "VoiceTecx: on-device dictation for the Mac, built for Taiwan Mandarin, English and Traditional Chinese. Your voice and text never leave your Mac."

export const metadata: Metadata = {
  title: "VoiceTecx",
  description,
  alternates: { canonical: `${baseUrl}/products/voicetecx` },
  openGraph: {
    title: "VoiceTecx · On-device dictation for the Mac",
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
        {/* Niko, 2026-11-26: the spec sheet on top, like every product page; the evidence and selling sections below. */}
        <ProductSpecPage spec={productSpec("voicetecx")!} />
        <VoiceTecxContent />
      </main>
      <Footer />
    </div>
  )
}
