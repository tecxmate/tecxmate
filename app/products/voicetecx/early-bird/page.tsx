import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { VoiceTecxEarlyBird } from "@/components/voicetecx-early-bird"
import type { Metadata } from "next"

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tecxmate.com"
const title = "VoiceTecx early-bird list"
const description = "Join the VoiceTecx early-bird list: NT$499 instead of NT$1,490, and an email when version 1.0 is out."

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${baseUrl}/products/voicetecx/early-bird` },
  openGraph: { title, description, url: `${baseUrl}/products/voicetecx/early-bird`, siteName: "Tecxmate", type: "website" },
}

export default function VoiceTecxEarlyBirdPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <VoiceTecxEarlyBird />
      </main>
      <Footer />
    </div>
  )
}
