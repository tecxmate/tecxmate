import type { Metadata } from "next"
import dynamic from "next/dynamic"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AnimationPauser } from "@/components/animation-pauser"
import { ClientsSection, FinalCta, ProductsGrid, ProductsHero, WhySection } from "@/components/products-home"

// Preview only: a product-first homepage for review. Not linked, not indexed;
// the live homepage at / is unchanged.

const TeamSection = dynamic(() => import("@/components/team-section").then((mod) => ({ default: mod.TeamSection })))
const StoriesSection = dynamic(() =>
  import("@/components/campaigns-section").then((mod) => ({ default: mod.StoriesSection })),
)

export const metadata: Metadata = {
  title: "Homepage preview",
  robots: { index: false, follow: false },
}

export default function HomePreview() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <AnimationPauser />
      <ProductsHero />
      <ProductsGrid />
      <WhySection />
      <TeamSection />
      <ClientsSection />
      <StoriesSection />
      <FinalCta />
      <Footer />
    </main>
  )
}
