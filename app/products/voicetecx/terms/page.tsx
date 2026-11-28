import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { VoiceTecxLegalContent } from "@/components/voicetecx-legal-content"
import type { Metadata } from "next"

// Draft: unfilled fields and a lawyer's read are pending, so it stays out of search and unlinked.
export const metadata: Metadata = {
  title: "VoiceTecx Licence Agreement",
  robots: { index: false, follow: false },
}

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <VoiceTecxLegalContent doc="terms" />
      </main>
      <Footer />
    </div>
  )
}
