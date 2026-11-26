import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ProductSpecPage } from "@/components/product-spec-page"
import { productSpec } from "@/lib/product-specs"
import type { Metadata } from "next"

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tecxmate.com"
const spec = productSpec("datatecx")!

export const metadata: Metadata = {
  title: spec.name,
  description: spec.metaDescription,
  alternates: { canonical: `${baseUrl}/products/datatecx` },
  openGraph: {
    title: `${spec.name} · ${spec.sub.en}`,
    description: spec.metaDescription,
    url: `${baseUrl}/products/datatecx`,
    siteName: "Tecxmate",
    type: "website",
    images: [{ url: `${baseUrl}/graphics/tecxmate-logo-cropped.png`, alt: "TECXMATE" }],
  },
}

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <ProductSpecPage spec={spec} />
      </main>
      <Footer />
    </div>
  )
}
