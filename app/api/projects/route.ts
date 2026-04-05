import { NextResponse } from "next/server"
import { WORDPRESS_API_URL } from "@/lib/wp-config"

export type WPProject = {
  id: number
  slug: string
  title: string
  excerpt: string
  content: string
  date: string
  coverImage: string
  link: string
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()
}

function decodeHtmlEntities(text: string) {
  if (!text) return ""
  let result = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
  result = result.replace(/&#(\d+);/g, (_, d) => String.fromCharCode(parseInt(d, 10)))
  result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
  return result
}

function wpFeaturedImage(post: any): string {
  const media = post._embedded?.["wp:featuredmedia"]?.[0]
  if (media?.source_url) return media.source_url
  if (post.jetpack_featured_media_url) return post.jetpack_featured_media_url
  if (typeof post.featured_image === "string" && post.featured_image) return post.featured_image
  return ""
}

export async function GET() {
  try {
    // Look up the "projects" tag ID
    const tagRes = await fetch(`${WORDPRESS_API_URL}/tags?slug=projects`, {
      next: { revalidate: 300 },
    })

    let tagId: number | undefined
    if (tagRes.ok) {
      const tagData = await tagRes.json()
      tagId = tagData?.[0]?.id
    }

    if (!tagId) {
      console.warn("⚠️ No 'projects' tag found in WordPress. Create a tag called 'projects' and tag your project posts with it.")
      return NextResponse.json([])
    }

    const url = `${WORDPRESS_API_URL}/posts?tags=${tagId}&per_page=20&_embed=1&orderby=date&order=desc`
    const res = await fetch(url, {
      next: { revalidate: 300 },
      headers: { Accept: "application/json" },
    })

    if (!res.ok) {
      console.error("❌ WordPress projects API error:", res.status)
      return NextResponse.json([])
    }

    const data = await res.json()
    if (!Array.isArray(data)) return NextResponse.json([])

    const projects: WPProject[] = data.map((p: any) => {
      let excerpt = decodeHtmlEntities(stripHtml(p.excerpt?.rendered || ""))
      if (excerpt.length > 150) {
        excerpt = excerpt.substring(0, 147).trim() + "..."
      }

      return {
        id: p.id,
        slug: p.slug,
        title: decodeHtmlEntities(stripHtml(p.title?.rendered || "Untitled")),
        excerpt,
        content: p.content?.rendered || "",
        date: new Date(p.date).toISOString(),
        coverImage: wpFeaturedImage(p),
        link: p.link || "",
      }
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error("❌ Error fetching WordPress projects:", error)
    return NextResponse.json([])
  }
}
