import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { ServicesSection } from "@/components/services-section"
import { Footer } from "@/components/footer"
import type { Metadata } from "next"
import Script from "next/script"
import dynamic from "next/dynamic"

// Lazy load below-the-fold components to reduce initial bundle and TBT
const DemoProductsSection = dynamic(() => import("@/components/demo-products-section").then(mod => ({ default: mod.DemoProductsSection })), {
  loading: () => <div className="h-64 bg-gray-50" />,
})

const CampaignsSection = dynamic(() => import("@/components/campaigns-section").then(mod => ({ default: mod.CampaignsSection })), {
  loading: () => <div className="h-64 bg-gray-50" />,
})

const TeamSection = dynamic(() => import("@/components/team-section").then(mod => ({ default: mod.TeamSection })), {
  loading: () => <div className="h-64 bg-gray-50" />,
})

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Script
        id="org-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfessionalService",
            "name": "Tecxmate",
            "alternateName": ["tecxmate", "TECXMATE Corporation Ltd.", "CÔNG TY TNHH TECXMATE", "達盟科技有限公司"],
            "url": process.env.NEXT_PUBLIC_SITE_URL || "https://www.tecxmate.com",
            "logo": `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.tecxmate.com"}/tecxmate-logo-cropped.png`,
            "image": `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.tecxmate.com"}/tecxmate-logo-cropped.png`,
            "description": "Premier technology consultancy providing AI development, web development, business automation, and digital transformation services for SMEs and startups.",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Villa Park Complex, Phu Huu Ward",
              "addressLocality": "Ho Chi Minh City",
              "addressCountry": "VN"
            },
            "contactPoint": [
              {
                "@type": "ContactPoint",
                "email": "ceo@tecxmate.com",
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
      <HeroSection />
      <ServicesSection />
      <DemoProductsSection />
      <CampaignsSection />
      <TeamSection />
      <Footer />
    </main>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tecxmate.com"
  const { generateCountryKeywords } = await import("@/lib/keywords")
  
  return {
    title: "Tecxmate - Premier Technology Consultancy for SMEs & Startups | AI Development & Web Solutions",
    description: "Transform your business with Tecxmate's cutting-edge technology solutions. Expert AI integration, web development, business automation, and digital transformation services. Fast delivery, innovative solutions for SMEs and founders. Book your free consultation today.",
    keywords: generateCountryKeywords([
      "technology consultancy",
      "AI development",
      "business automation",
      "web development",
      "startup consulting",
      "SME solutions",
      "digital transformation",
      "software development",
      "AI integration",
      "tech consulting Taiwan",
      "business technology",
      "blockchain development",
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
      title: "Tecxmate - Premier Technology Consultancy for SMEs & Startups",
      description: "Transform your business with AI-powered solutions, web development, and business automation. Fast delivery, innovative technology consulting for SMEs and founders. Book your free discovery call.",
      url: baseUrl,
      siteName: "Tecxmate",
      locale: "en_US",
      alternateLocale: ["en_TW", "en_VN", "en_CN", "vi_VN", "zh_TW", "zh_CN"],
      type: "website",
      images: [
        {
          url: `${baseUrl}/tecxmate-logo-cropped.png`,
          width: 1200,
          height: 630,
          alt: "Tecxmate - Premier Technology Consultancy for SMEs and Startups",
          type: "image/png",
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Tecxmate - Premier Technology Consultancy for SMEs & Startups",
      description: "Transform your business with AI-powered solutions, web development, and business automation. Fast delivery, innovative technology consulting.",
      images: [`${baseUrl}/tecxmate-logo-cropped.png`],
      creator: "@tecxmate",
    },
  }
}
