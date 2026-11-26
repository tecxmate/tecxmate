import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { VoiceTecxContent } from "@/components/voicetecx-content"
import type { Metadata } from "next"

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tecxmate.com"
const description =
  "VoiceTecx: offline dictation for the Mac, built for Taiwan Mandarin, English and Traditional Chinese. Nothing leaves your computer."

export const metadata: Metadata = {
  title: "VoiceTecx",
  description,
  alternates: { canonical: `${baseUrl}/products/voicetecx` },
  openGraph: {
    title: "VoiceTecx · Offline dictation for the Mac",
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
        <VoiceTecxContent />
      </main>
      <Footer />
    </div>
  )
}
