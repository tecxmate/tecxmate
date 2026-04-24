import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { BlogListing } from "@/components/blog-listing"
import type { Metadata } from "next"
import Script from "next/script"
import { wpGetAllPosts } from "@/lib/wordpress"
import { Suspense } from "react"
import { generateCountryKeywords } from "@/lib/keywords"

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tecxmate.com"

export const metadata: Metadata = {
  title: "Blog - Technology Insights & Expert Articles | Tecxmate",
  description: "Insights, tutorials, and updates from our team of technology consultancy experts. Learn about web development, business technology, digital transformation, and SME solutions.",
  keywords: generateCountryKeywords([
    "technology blog",
    "web development",
    "business technology",
    "digital transformation",
    "startup insights",
    "SME solutions",
    "tech consultancy",
    "software development",
    "business strategy",
  ]),
  alternates: {
    canonical: `${baseUrl}/blog`,
    languages: {
      'en': `${baseUrl}/blog`,
      'en-TW': `${baseUrl}/blog`,
      'en-VN': `${baseUrl}/blog`,
      'en-CN': `${baseUrl}/blog`,
      // Note: Language routes don't exist yet - pointing to English for now
      'vi': `${baseUrl}/blog`, // Will be `${baseUrl}/vi/blog` when route exists
      'vi-VN': `${baseUrl}/blog`,
      'zh': `${baseUrl}/blog`, // Will be `${baseUrl}/zh/blog` when route exists
      'zh-TW': `${baseUrl}/blog`,
      'zh-CN': `${baseUrl}/blog`,
      'x-default': `${baseUrl}/blog`,
    },
    types: {
      'application/rss+xml': `${baseUrl}/feed.xml`,
    },
  },
  openGraph: {
    title: "Blog - Technology Insights & Expert Articles | Tecxmate",
    description: "Insights, tutorials, and updates from our team of technology consultancy experts. Learn about web development, business technology, and digital transformation.",
    url: `${baseUrl}/blog`,
    siteName: "Tecxmate",
    locale: "en_US",
    alternateLocale: ["en_TW", "en_VN", "en_CN", "vi_VN", "zh_TW", "zh_CN"],
    type: "website",
    images: [
      {
        url: `${baseUrl}/graphics/tecxmate-logo-cropped.png`,
        width: 1200,
        height: 630,
        alt: "Tecxmate Blog",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog - Technology Insights & Expert Articles | Tecxmate",
    description: "Insights, tutorials, and updates from our team of technology consultancy experts.",
    images: [`${baseUrl}/graphics/tecxmate-logo-cropped.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default async function BlogPage() {
  const posts = await wpGetAllPosts()

  // Generate structured data for blog listing page
  const blogStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${baseUrl}/blog`,
    "name": "Tecxmate Blog",
    "description": "Insights, tutorials, and updates from our team of technology consultancy experts",
    "url": `${baseUrl}/blog`,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": posts.length,
      "itemListElement": posts.slice(0, 10).map((post, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "BlogPosting",
          "@id": `${baseUrl}/blog/${post.slug}`,
          "headline": post.title,
          "description": post.excerpt,
          "image": post.coverImage,
          "datePublished": post.date,
        }
      }))
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
        "name": "Blog",
        "item": `${baseUrl}/blog`
      }
    ]
  }

  return (
    <>
      <Script
        id="blog-collection-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogStructuredData) }}
      />
      <Script
        id="blog-breadcrumb-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />
      <div className="min-h-screen bg-white overflow-x-hidden w-full">
        <Navbar />
        <main className="overflow-x-hidden w-full">
          <section className="bg-primary/5 py-16 md:py-24">
            <div className="container px-4 md:px-6">
              <div className="mx-auto max-w-2xl text-center">
                <h1 className="text-3xl font-semibold md:text-4xl lg:text-5xl mb-6">News & Insights</h1>
                <p className="mt-4 text-gray-500 md:text-xl/relaxed">
                  Stay updated with the latest trends and insights
                </p>
              </div>
            </div>
          </section>

          <section className="py-12 md:py-16">
            <div className="container px-4 md:px-6">
              <Suspense fallback={
                <div className="flex justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              }>
                <BlogListing />
              </Suspense>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  )
}
