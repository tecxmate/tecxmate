import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CareersContent } from "@/components/careers-content"
import type { Metadata } from "next"

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tecxmate.com"
const description =
  "Join TECXMATE, building at the frontier of AI product development. Roles are posted on TECXWORK, the hiring platform we built and run ourselves."

export const metadata: Metadata = {
  title: "Careers",
  description,
  alternates: { canonical: `${baseUrl}/careers` },
  openGraph: {
    title: "Careers at TECXMATE",
    description,
    url: `${baseUrl}/careers`,
    siteName: "Tecxmate",
    type: "website",
    images: [{ url: `${baseUrl}/graphics/tecxmate-logo-cropped.png`, alt: "TECXMATE" }],
  },
}

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <CareersContent />
      </main>
      <Footer />
    </div>
  )
}
