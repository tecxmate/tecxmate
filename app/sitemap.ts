import type { MetadataRoute } from "next"
import { wpGetAllPosts } from "@/lib/wordpress"
import { WORDPRESS_API_URL } from "@/lib/wp-config"
import { isSectionEnabled, readContent } from "@/lib/site-content"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await readContent({ revalidate: 60 })
  const blogEnabled = isSectionEnabled(content, "blog")
  const aboutEnabled = isSectionEnabled(content, "about")

  // Use root domain (without www) for consistency with robots.txt
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tecxmate.com"
  // Remove www if present to ensure consistent canonical URL
  const rootUrl = baseUrl.replace(/^https?:\/\/(www\.)?/, 'https://')

  const staticUrls: MetadataRoute.Sitemap = [
    { 
      url: `${rootUrl}/`, 
      lastModified: new Date(), 
      changeFrequency: "daily", 
      priority: 1 
    },
    { 
      url: `${rootUrl}/services`, 
      lastModified: new Date(), 
      changeFrequency: "weekly", 
      priority: 0.9 
    },
    { 
      url: `${rootUrl}/services/ai-application-development`, 
      lastModified: new Date(), 
      changeFrequency: "monthly", 
      priority: 0.8 
    },
    { 
      url: `${rootUrl}/services/business-automation`, 
      lastModified: new Date(), 
      changeFrequency: "monthly", 
      priority: 0.8 
    },
    { 
      url: `${rootUrl}/services/ai-integration-consulting`, 
      lastModified: new Date(), 
      changeFrequency: "monthly", 
      priority: 0.8 
    },
    ...(aboutEnabled
      ? [{
          url: `${rootUrl}/about`,
          lastModified: new Date(),
          changeFrequency: "monthly" as const,
          priority: 0.8,
        }]
      : []),
    ...(blogEnabled
      ? [{
          url: `${rootUrl}/blog`,
          lastModified: new Date(),
          changeFrequency: "daily" as const,
          priority: 0.9,
        }]
      : []),
    { 
      url: `${rootUrl}/privacy-policy`, 
      lastModified: new Date(), 
      changeFrequency: "yearly", 
      priority: 0.5 
    },
    { 
      url: `${rootUrl}/terms-of-service`, 
      lastModified: new Date(), 
      changeFrequency: "yearly", 
      priority: 0.5 
    },
    ...(blogEnabled
      ? [{
          url: `${rootUrl}/feed.xml`,
          lastModified: new Date(),
          changeFrequency: "daily" as const,
          priority: 0.8,
        }]
      : []),
  ]

  let postUrls: MetadataRoute.Sitemap = []
  try {
    if (!blogEnabled) return staticUrls

    const posts = await wpGetAllPosts()
    // Fetch raw posts to get actual modified dates
    const rawPostsRes = await fetch(`${WORDPRESS_API_URL}/posts?per_page=100&_fields=slug,modified`, {
      next: { revalidate: 300 }
    })
    
    if (rawPostsRes.ok) {
      const rawPosts = await rawPostsRes.json()
      const postDatesMap = new Map<string, string>(rawPosts.map((p: any) => [p.slug, p.modified]))
      
      // Create URLs for blog posts
      postUrls = posts.map((p) => {
        const modifiedDate = postDatesMap.get(p.slug)
        return {
          url: `${rootUrl}/blog/${encodeURIComponent(p.slug)}`,
          lastModified: modifiedDate ? new Date(modifiedDate) : new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        }
      })
    } else {
      // Fallback: use current date if we can't fetch dates
      postUrls = posts.map((p) => ({
        url: `${rootUrl}/blog/${encodeURIComponent(p.slug)}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }))
    }
  } catch (e) {
    console.error("Error generating sitemap:", e)
    // ignore and return static urls
  }

  return [...staticUrls, ...postUrls]
}

