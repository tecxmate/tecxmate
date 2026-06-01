import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AboutContent } from "@/components/about-content"
import { company } from "@/lib/company"
import { readContent } from "@/lib/site-content"
import type { Metadata } from "next"
import Script from "next/script"

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tecxmate.com"

// Read the latest editable content on each request so admin edits go live.
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "About Us - Technology Consultancy Team | Tecxmate",
  description: "Learn About TECXMATE - a premier technology consultancy specializing in AI development, business automation, and digital transformation for SMEs and startups. LLC headquartered in Ho Chi Minh City, Vietnam. Operating in Taiwan, US, and Vietnam.",
  keywords: [
    "About TECXMATE",
    "technology consultancy team",
    "AI development company",
    "Vietnam tech consultancy",
    "business automation experts",
    "digital transformation consultants",
    "SME technology solutions",
    "startup consulting team"
  ].join(", "),
  alternates: {
    canonical: `${baseUrl}/about`,
  },
  openGraph: {
    title: "About Us - Technology Consultancy Team | Tecxmate",
    description: "Learn About TECXMATE - a premier technology consultancy specializing in AI development, business automation, and digital transformation for SMEs and startups.",
    url: `${baseUrl}/about`,
    siteName: "Tecxmate",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${baseUrl}/graphics/tecxmate-logo-cropped.png`,
        width: 1200,
        height: 630,
        alt: "About TECXMATE - Technology Consultancy Team",
        type: "image/png",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us - Technology Consultancy Team | Tecxmate",
    description: "Learn About TECXMATE - a premier technology consultancy specializing in AI development, business automation, and digital transformation.",
    images: [`${baseUrl}/graphics/tecxmate-logo-cropped.png`],
  },
}

export default async function AboutPage() {
  const { about } = await readContent()

  const aboutStructuredData = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "mainEntity": {
      "@type": "Organization",
      "name": company.name,
      "legalName": company.legalName.en,
      "foundingDate": "2025",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": company.address.street,
        "addressLocality": company.address.locality,
        "addressCountry": company.address.countryCode
      },
      "description": "Premier technology consultancy specializing in AI development, business automation, and digital transformation for SMEs and startups.",
      "url": baseUrl,
    }
  }

  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "About",
        "item": `${baseUrl}/about`
      }
    ]
  }

  return (
    <>
      <Script
        id="about-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutStructuredData) }}
      />
      <Script
        id="about-breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <AboutContent about={about} />

          <section className="py-12 md:py-16 pt-0">
            <div className="container px-4 md:px-6 max-w-4xl">
              <div className="prose prose-lg max-w-none">
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Company Information</h2>
                  <dl className="grid gap-3 text-muted-foreground">
                    <div>
                      <dt className="font-medium text-foreground">Formation</dt>
                      <dd>{company.formation}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-foreground">Headquarters</dt>
                      <dd>{company.address.street}, {company.address.locality}, {company.address.country}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-foreground">Legal Name (EN)</dt>
                      <dd>{company.legalName.en}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-foreground">Legal Name (VN)</dt>
                      <dd>{company.legalName.vi}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-foreground">Operating Markets</dt>
                      <dd>{company.operatingMarkets.join(", ")}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-foreground">Contact</dt>
                      <dd><a href={`mailto:${company.contactEmail}`} className="text-primary hover:underline">{company.contactEmail}</a></dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  )
}

