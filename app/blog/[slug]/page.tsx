import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { BlogPostContent } from "@/components/blog-post-content"
import { wpGetPostBySlug } from "@/lib/wordpress"
import { WORDPRESS_API_URL } from "@/lib/wp-config"
import { generateCountryKeywords } from "@/lib/keywords"
import type { Metadata } from "next"
import Script from "next/script"
import { notFound } from "next/navigation"

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await wpGetPostBySlug(slug)
  
  if (!post) {
    notFound()
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tecxmate.com"
  
  // Fetch raw post data for structured data
  let rawPost: any = null
  try {
    const res = await fetch(`${WORDPRESS_API_URL}/posts?slug=${encodeURIComponent(slug)}&_embed=1`, {
      next: { revalidate: 300 }
    })
    if (res.ok) {
      const data = await res.json()
      rawPost = data[0]
    }
  } catch (e) {
    // ignore
  }

  // Generate comprehensive structured data for SEO
  const structuredData = rawPost ? [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "@id": `${baseUrl}/blog/${slug}`,
      "headline": post.title,
      "description": post.excerpt.slice(0, 160),
      "image": post.coverImage ? [
        {
          "@type": "ImageObject",
          "url": post.coverImage,
          "width": 1200,
          "height": 630
        }
      ] : [],
      "author": {
        "@type": "Organization",
        "name": "Tecxmate",
        "url": baseUrl,
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/graphics/tecxmate-logo-cropped.png`
        }
      },
      "publisher": {
        "@type": "Organization",
        "name": "Tecxmate",
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/graphics/tecxmate-logo-cropped.png`,
          "width": 512,
          "height": 512
        }
      },
      "datePublished": rawPost.date,
      "dateModified": rawPost.modified || rawPost.date,
      "url": `${baseUrl}/blog/${slug}`,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `${baseUrl}/blog/${slug}`
      },
      "articleSection": post.category,
      "inLanguage": "en",
      "wordCount": post.content ? post.content.replace(/<[^>]*>/g, "").split(/\s+/).length : 0,
      "keywords": generateCountryKeywords([
        post.category,
        ...(post.tags || []),
        'technology',
        'business',
        'consulting',
      ]),
      "about": post.tags && post.tags.length > 0 
        ? post.tags.map((tag: string) => ({
            "@type": "Thing",
            "name": tag
          }))
        : undefined,
      "audience": {
        "@type": "Audience",
        "audienceType": "Business",
        "geographicArea": {
          "@type": "Country",
          "name": ["Taiwan", "United States", "Vietnam"]
        }
      }
    },
    {
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
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": post.title,
          "item": `${baseUrl}/blog/${slug}`
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "@id": `${baseUrl}/blog/${slug}`,
      "headline": post.title,
      "description": post.excerpt.slice(0, 160),
      "image": post.coverImage,
      "author": {
        "@type": "Organization",
        "name": "Tecxmate"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Tecxmate",
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/graphics/tecxmate-logo-cropped.png`
        }
      },
      "datePublished": rawPost.date,
      "dateModified": rawPost.modified || rawPost.date,
      "url": `${baseUrl}/blog/${slug}`,
      "keywords": generateCountryKeywords([
        post.category,
        ...(post.tags || []),
        'technology',
        'business',
        'consulting',
      ]),
      "articleSection": post.category,
      "about": post.tags && post.tags.length > 0 
        ? post.tags.map((tag: string) => ({
            "@type": "Thing",
            "name": tag
          }))
        : undefined
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Tecxmate",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/graphics/tecxmate-logo-cropped.png`
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Villa Park Complex, Phu Huu Ward",
        "addressLocality": "Ho Chi Minh City",
        "addressCountry": "VN"
      },
      "areaServed": [
        {
          "@type": "Country",
          "name": "Taiwan"
        },
        {
          "@type": "Country",
          "name": "United States"
        },
        {
          "@type": "Country",
          "name": "Vietnam"
        }
      ]
    }
  ] : null

  return (
    <>
      {structuredData && structuredData.map((data, index) => (
        <Script
          key={`structured-data-${index}`}
          id={`blog-structured-data-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
      <div className="min-h-screen bg-white overflow-x-hidden w-full">
        <Navbar />
        <BlogPostContent slug={slug} />
        <Footer />
      </div>
    </>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await wpGetPostBySlug(slug)

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tecxmate.com"
  const canonicalUrl = `${baseUrl}/blog/${slug}`
  const description = post.excerpt.slice(0, 160)

  // Fetch raw post for date information
  let publishedDate: string | undefined
  let modifiedDate: string | undefined
  try {
    const res = await fetch(`${WORDPRESS_API_URL}/posts?slug=${encodeURIComponent(slug)}&_fields=date,modified`, {
      next: { revalidate: 300 }
    })
    if (res.ok) {
      const data = await res.json()
      if (data[0]) {
        publishedDate = data[0].date
        modifiedDate = data[0].modified || data[0].date
      }
    }
  } catch (e) {
    // ignore
  }

  // Generate country-specific keywords
  const titleWords = post.title.toLowerCase().split(/\s+/).filter(w => w.length > 3).slice(0, 5)
  const tags = post.tags && post.tags.length > 0 ? post.tags : []
  const baseKeywords = [
    post.category,
    ...tags,
    'technology',
    'business',
    'consulting',
    ...titleWords,
    'tecxmate',
    'SME solutions',
    'startup consulting',
    'web development',
    'digital transformation',
  ]
  
  return {
    title: `${post.title} | Tecxmate Blog`,
    description,
    keywords: generateCountryKeywords(baseKeywords),
    creator: 'Tecxmate',
    publisher: 'Tecxmate',
    authors: [{ name: 'Tecxmate', url: baseUrl }],
    applicationName: 'Tecxmate',
    category: post.category,
    classification: 'Technology Blog',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': canonicalUrl,
        'en-TW': canonicalUrl,
        'en-VN': canonicalUrl,
        'en-CN': canonicalUrl,
        // Note: Language routes (/vi/blog/, /zh/blog/) don't exist yet
        // When implemented, update these URLs to point to actual language routes
        'vi': canonicalUrl, // Will be `${baseUrl}/vi/blog/${slug}` when route exists
        'vi-VN': canonicalUrl,
        'zh': canonicalUrl, // Will be `${baseUrl}/zh/blog/${slug}` when route exists
        'zh-TW': canonicalUrl,
        'zh-CN': canonicalUrl,
        'x-default': canonicalUrl,
      },
      types: {
        'application/rss+xml': `${baseUrl}/feed.xml`,
      },
    },
    openGraph: {
      title: post.title,
      description,
      url: canonicalUrl,
      siteName: 'Tecxmate',
      locale: 'en_US',
      alternateLocale: ['en_TW', 'en_VN', 'en_CN', 'vi_VN', 'zh_TW', 'zh_CN'],
      type: 'article',
      publishedTime: publishedDate,
      modifiedTime: modifiedDate || publishedDate,
      authors: ['Tecxmate'],
      section: post.category,
      tags: post.tags && post.tags.length > 0 
        ? [post.category, ...post.tags, 'technology', 'business', 'consulting']
        : [post.category, 'technology', 'business', 'consulting'],
      images: post.coverImage ? [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
          type: 'image/jpeg',
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: post.coverImage ? [post.coverImage] : [],
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
}
