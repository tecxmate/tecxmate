import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { Footer } from "@/components/footer"
import type { Metadata } from "next"
import Script from "next/script"
import dynamic from "next/dynamic"
import { isSectionEnabled, readContent } from "@/lib/site-content"
import { AnimationPauser } from "@/components/animation-pauser"

// Lazy load below-the-fold components to reduce initial bundle and TBT
const EconomicsSection = dynamic(() => import("@/components/sales/economics-section").then(mod => ({ default: mod.EconomicsSection })))

const OrgSection = dynamic(() => import("@/components/sales/org-section").then(mod => ({ default: mod.OrgSection })))

const ProofSection = dynamic(() => import("@/components/sales/proof-section").then(mod => ({ default: mod.ProofSection })))

const TechnologySection = dynamic(() => import("@/components/sales/technology-section").then(mod => ({ default: mod.TechnologySection })))

const ProcessSection = dynamic(() => import("@/components/sales/process-section").then(mod => ({ default: mod.ProcessSection })))

const CtaSection = dynamic(() => import("@/components/sales/cta-section").then(mod => ({ default: mod.CtaSection })))

const CampaignsSection = dynamic(() => import("@/components/campaigns-section").then(mod => ({ default: mod.CampaignsSection })))

const TeamSection = dynamic(() => import("@/components/team-section").then(mod => ({ default: mod.TeamSection })))

export default async function Home() {
  const content = await readContent({ revalidate: 60 })

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
            "@type": "ProfessionalService",
            "name": "Tecxmate",
            "alternateName": ["tecxmate", "TECXMATE COMPANY LIMITED", "CÔNG TY TNHH TECXMATE"],
            "url": process.env.NEXT_PUBLIC_SITE_URL || "https://www.tecxmate.com",
            "logo": `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.tecxmate.com"}/graphics/tecxmate-logo-cropped.png`,
            "image": `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.tecxmate.com"}/graphics/tecxmate-logo-cropped.png`,
            "description": "English websites and software for Taiwan's manufacturers going global — fast English-first sites, plus the apps, automation, and AI behind them, built by engineers who understand your products.",
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
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Technology Consultancy Services",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "AI Development & Integration",
                    "description": "Cutting-edge AI application development and integration services"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Web Development",
                    "description": "Custom web development and software solutions"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Business Automation",
                    "description": "Streamline operations with automated workflows and system integration"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Digital Transformation",
                    "description": "Comprehensive digital transformation consulting for SMEs"
                  }
                }
              ]
            }
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
            "url": process.env.NEXT_PUBLIC_SITE_URL || "https://www.tecxmate.com",
            "potentialAction": {
              "@type": "SearchAction",
              "target": (process.env.NEXT_PUBLIC_SITE_URL || "https://www.tecxmate.com") + "/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          }),
        }}
      />
      {isSectionEnabled(content, "hero") && <HeroSection />}
      {isSectionEnabled(content, "team") && <TeamSection />}
      {isSectionEnabled(content, "proof") && <ProofSection />}
      {isSectionEnabled(content, "economics") && <EconomicsSection />}
      {isSectionEnabled(content, "problem") && <OrgSection />}
      {isSectionEnabled(content, "technology") && <TechnologySection />}
      {isSectionEnabled(content, "process") && <ProcessSection />}
      {isSectionEnabled(content, "blog") && <CampaignsSection />}
      {isSectionEnabled(content, "cta") && <CtaSection />}
      <Footer />
    </main>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tecxmate.com"
  const { generateCountryKeywords } = await import("@/lib/keywords")

  return {
    title: "TECXMATE - English Websites & Software for Taiwan's Manufacturers",
    description: "Fast, English-first websites — plus the apps, automation, and AI behind them — for Taiwan's manufacturers going global. Built by engineers who understand your products, not a generic translator. Book a free consultation.",
    keywords: generateCountryKeywords([
      "English website Taiwan manufacturer",
      "manufacturer website design Taiwan",
      "English website for exporters",
      "web development",
      "AI development",
      "business automation",
      "SME solutions",
      "software development",
      "AI integration",
      "tech consulting Taiwan",
      "mobile app development",
      "enterprise solutions",
      "Taiwan tech consultancy"
    ]),
    alternates: {
      canonical: baseUrl,
      languages: {
        'en': baseUrl,
        'en-TW': baseUrl,
        'en-VN': baseUrl,
        'en-CN': baseUrl,
        // Note: Language routes don't exist yet - pointing to English for now
        'vi': baseUrl, // Will be `${baseUrl}/vi` when route exists
        'vi-VN': baseUrl,
        'zh': baseUrl, // Will be `${baseUrl}/zh` when route exists
        'zh-TW': baseUrl,
        'zh-CN': baseUrl,
        'x-default': baseUrl,
      },
    },
    openGraph: {
      title: "TECXMATE - English Websites & Software for Taiwan's Manufacturers",
      description: "Fast, English-first websites — plus the apps, automation, and AI behind them — for Taiwan's manufacturers going global. Built by engineers who understand your products. Book your free consultation.",
      url: baseUrl,
      siteName: "Tecxmate",
      locale: "en_US",
      alternateLocale: ["en_TW", "en_VN", "en_CN", "vi_VN", "zh_TW", "zh_CN"],
      type: "website",
      images: [
        {
          url: `${baseUrl}/graphics/tecxmate-logo-cropped.png`,
          width: 1200,
          height: 630,
          alt: "TECXMATE - English Websites & Software for Taiwan's Manufacturers",
          type: "image/png",
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "TECXMATE - English Websites & Software for Taiwan's Manufacturers",
      description: "Fast, English-first websites — plus the apps, automation, and AI behind them — for Taiwan's manufacturers going global. Built by engineers who understand your products.",
      images: [`${baseUrl}/graphics/tecxmate-logo-cropped.png`],
      creator: "@tecxmate",
    },
  }
}
