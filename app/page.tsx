import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import type { Metadata } from "next"
import Script from "next/script"
import dynamic from "next/dynamic"
import { AnimationPauser } from "@/components/animation-pauser"
import { FinalCta, ProductsGrid, ProductsHero } from "@/components/products-home"
import { SHOW_PRODUCTS } from "@/lib/features"

// The homepage frames TECXMATE as a product company. The order is fixed here;
// the admin "homepage order" setting only applied to the old sales sections.
const TeamSection = dynamic(() => import("@/components/team-section").then((mod) => ({ default: mod.TeamSection })))
const StoriesSection = dynamic(() =>
  import("@/components/campaigns-section").then((mod) => ({ default: mod.StoriesSection })),
)

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tecxmate.com"
const HOME_TITLE = "TECXMATE — Frontier AI-native products"
const HOME_DESCRIPTION =
  "TECXMATE builds AI-native products: TecxMap (Taiwan business map), DataTecx (sovereign AI for Taiwan data), AlphaTecx (Taiwan stock AI) and eTecx."

const PRODUCTS_JSONLD = [
  { name: "TecxMap", url: "https://map.tecxmate.com", description: "A map of about 1.7 million businesses registered in Taiwan, with district data from government open datasets." },
  { name: "DataTecx", description: "Sovereign AI for Taiwan data: a data layer and a small open AI model, built to run offline on an agency's own servers." },
  { name: "AlphaTecx", description: "Taiwan Stock AI Connector: connects Claude to Taiwan stock-market open data for sourced answers." },
  { name: "eTecx", description: "A power-electronics circuit simulator, desktop and web, with built-in AI design help." },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <AnimationPauser />
      <Script
        id="org-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "TECXMATE",
            "legalName": "TECXMATE COMPANY LIMITED",
            "alternateName": ["Tecxmate", "CÔNG TY TNHH TECXMATE"],
            "url": SITE_URL,
            "logo": `${SITE_URL}/graphics/tecxmate-logo-cropped.png`,
            "image": `${SITE_URL}/graphics/tecxmate-logo-cropped.png`,
            "description": HOME_DESCRIPTION,
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Villa Park Villa Compound, Bung Ong Thoan Street, Long Truong Ward",
              "addressLocality": "Ho Chi Minh City",
              "addressCountry": "VN"
            },
            "contactPoint": [
              {
                "@type": "ContactPoint",
                "email": "official@tecxmate.com",
                "telephone": "+1-617-272-9992",
                "contactType": "Customer Service",
                "areaServed": "US",
                "availableLanguage": ["English", "Chinese"]
              },
              {
                "@type": "ContactPoint",
                "telephone": "+886-966-860-2602",
                "contactType": "Customer Service",
                "areaServed": "TW",
                "availableLanguage": ["English", "Chinese"]
              },
              {
                "@type": "ContactPoint",
                "telephone": "+84-33-746-0602",
                "contactType": "Customer Service",
                "areaServed": "VN",
                "availableLanguage": ["English", "Vietnamese"]
              }
            ],
            "sameAs": [
              "https://www.facebook.com/tecxmate",
              "https://x.com/tecxmate",
              "https://www.instagram.com/tecxmate",
              "https://tw.linkedin.com/company/tecxmate"
            ],
            "makesOffer": PRODUCTS_JSONLD.map((product) => ({
              "@type": "Offer",
              "itemOffered": { "@type": "SoftwareApplication", ...product },
            })),
          }),
        }}
      />
      <Script
        id="website-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "tecxmate",
            "url": SITE_URL,
            "potentialAction": {
              "@type": "SearchAction",
              "target": (SITE_URL) + "/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          }),
        }}
      />
      <ProductsHero />
      <StoriesSection />
      {SHOW_PRODUCTS && <ProductsGrid />}
      <TeamSection />
      <FinalCta />
      <Footer />
    </main>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = SITE_URL
  const { generateCountryKeywords } = await import("@/lib/keywords")
  // Keywords and the Twitter handle still come from Admin > Metadata; the homepage
  // title and descriptions are fixed in code so they always describe the products.
  const { readContent } = await import("@/lib/site-content")
  const { seo } = await readContent({ revalidate: 60 })

  return {
    title: { absolute: HOME_TITLE },
    description: HOME_DESCRIPTION,
    keywords: generateCountryKeywords(seo.keywords),
    alternates: {
      canonical: baseUrl,
      languages: {
        'en': baseUrl,
        'en-TW': baseUrl,
        'en-VN': baseUrl,
        'en-CN': baseUrl,
        // Note: Language routes don't exist yet - pointing to English for now
        'zh': baseUrl, // Will be `${baseUrl}/zh` when route exists
        'zh-TW': baseUrl,
        'zh-CN': baseUrl,
        'x-default': baseUrl,
      },
    },
    openGraph: {
      title: HOME_TITLE,
      description: HOME_DESCRIPTION,
      url: baseUrl,
      siteName: "Tecxmate",
      locale: "en_US",
      alternateLocale: ["en_TW", "en_VN", "en_CN", "zh_TW", "zh_CN"],
      type: "website",
      images: [
        {
          url: `${baseUrl}/graphics/tecxmate-logo-cropped.png`,
          width: 1200,
          height: 630,
          alt: HOME_TITLE,
          type: "image/png",
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: HOME_TITLE,
      description: HOME_DESCRIPTION,
      images: [`${baseUrl}/graphics/tecxmate-logo-cropped.png`],
      creator: seo.twitterCreator,
    },
  }
}
