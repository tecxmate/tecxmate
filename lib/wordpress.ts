import { useLanguage } from "@/components/language-provider"

export type WPBlogPost = {
  id: number
  slug: string
  title: string
  excerpt: string
  date: string
  readTime: string
  category: string
  coverImage: string
  content?: string
  tags?: string[]
  citations?: string
}

export type WPComment = {
  id: number
  authorName: string
  authorUrl?: string
  authorAvatar?: string
  date: string
  content: string
  parent?: number
}

import { WORDPRESS_API_URL } from "./wp-config"
import { getStoredBlogPostBySlug, readStoredBlogPosts } from "./blog-store"

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()
}

function decodeHtmlEntities(text: string) {
  if (!text) return ""
  // Named entities
  const named = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
  }
  let result = text.replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;/g, (m) => (named as any)[m] || m)
  // Numeric decimal entities
  result = result.replace(/&#(\d+);/g, (_, d) => String.fromCharCode(parseInt(d, 10)))
  // Numeric hex entities
  result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
  return result
}

function estimateReadTime(text: string) {
  const words = text.split(/\s+/).length
  const minutes = Math.max(1, Math.round(words / 200))
  return `${minutes} min read`
}

function wpFeaturedImage(post: any) {
  const media = post._embedded?.["wp:featuredmedia"]?.[0]
  if (media?.source_url) return media.source_url
  if (post.jetpack_featured_media_url) return post.jetpack_featured_media_url
  if (typeof post.featured_image === "string" && post.featured_image) return post.featured_image
  return "/placeholder.svg?height=200&width=400"
}

function wpPrimaryCategory(post: any) {
  const cat = post._embedded?.["wp:term"]?.[0]?.[0]
  return cat?.name || "Uncategorized"
}

function wpTags(post: any): string[] {
  const tags = post._embedded?.["wp:term"]?.[1] || []
  return tags.map((tag: any) => tag.name || "").filter((name: string) => name.length > 0)
}

const languageToTagSlug: Record<string, string> = {
  en: "en",
  vi: "vn",
  zh: "zh",
}

export async function wpGetAllPosts(language: string = "en"): Promise<WPBlogPost[]> {
  const normalizedLanguage = language?.toLowerCase?.() || "en"
  const storedPosts = (await readStoredBlogPosts({ revalidate: 300 })).filter((post) => {
    return post.language === normalizedLanguage || (normalizedLanguage === "en" && post.tags?.includes("en"))
  })

  if (process.env.BLOG_SOURCE === "local") {
    return storedPosts
  }

  try {
    const tagSlug = languageToTagSlug[normalizedLanguage] || languageToTagSlug.en
    let tagId: number | undefined

    try {
      const tagRes = await fetch(`${WORDPRESS_API_URL}/tags?slug=${encodeURIComponent(tagSlug)}`)

      if (tagRes.ok) {
        const tagData = await tagRes.json()
        tagId = tagData?.[0]?.id

        if (!tagId) {
          console.warn("No WordPress tag found for language slug:", { language: normalizedLanguage, tagSlug })
        }
      } else {
        console.warn("Failed to fetch WordPress tag for language:", {
          language: normalizedLanguage,
          tagSlug,
          status: tagRes.status,
          statusText: tagRes.statusText,
        })
      }
    } catch (tagError) {
      console.error("Error fetching WordPress tag:", { language: normalizedLanguage, tagSlug, error: tagError })
    }

    const params = new URLSearchParams({
      per_page: "20",
      _embed: "1",
    })

    if (tagId) {
      params.append("tags", String(tagId))
    }

    const url = `${WORDPRESS_API_URL}/posts?${params.toString()}`
    console.log('🔍 Fetching WordPress posts from:', url)
    
    const res = await fetch(url, { 
      next: { revalidate: 300 },
      headers: {
        'Accept': 'application/json',
      }
    })
    
    if (!res.ok) {
      const errorText = await res.text()
      console.error('❌ WordPress API Error:', {
        status: res.status,
        statusText: res.statusText,
        url,
        error: errorText
      })
      return storedPosts
    }
    
    const data = await res.json()
    console.log('✅ WordPress API Response:', {
      postsCount: Array.isArray(data) ? data.length : 0,
      firstPost: Array.isArray(data) && data.length > 0 ? {
        id: data[0].id,
        slug: data[0].slug,
        title: data[0].title?.rendered
      } : null
    })
    
    if (!Array.isArray(data)) {
      console.error('❌ WordPress API returned non-array data:', data)
      return storedPosts
    }
    
    const posts = data.map((p: any) => {
      // Decode URL-encoded slugs (important for non-ASCII characters)
      let decodedSlug = p.slug
      try {
        decodedSlug = decodeURIComponent(p.slug)
      } catch (e) {
        // If decoding fails, use original slug
        console.warn('Failed to decode slug:', p.slug)
      }
      
      // Truncate excerpt to reasonable length (150 characters max)
      let excerpt = decodeHtmlEntities(stripHtml(p.excerpt?.rendered || ""))
      if (excerpt.length > 150) {
        excerpt = excerpt.substring(0, 147).trim() + "..."
      }
      
      return {
        id: p.id,
        slug: decodedSlug,
        title: decodeHtmlEntities(stripHtml(p.title?.rendered || "Untitled")),
        excerpt,
        date: new Date(p.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        readTime: estimateReadTime(stripHtml(p.content?.rendered || "")),
        category: wpPrimaryCategory(p),
        coverImage: wpFeaturedImage(p),
        tags: wpTags(p),
      }
    })
    
    console.log('✅ Processed posts:', posts.length)
    return [...posts, ...storedPosts]
  } catch (error) {
    console.error('❌ Error fetching WordPress posts:', error)
    return storedPosts
  }
}

export async function wpGetPostBySlug(slug: string): Promise<WPBlogPost | null> {
  const storedPost = await getStoredBlogPostBySlug(slug)
  if (storedPost) return storedPost

  if (process.env.BLOG_SOURCE === "local") {
    return null
  }

  try {
    // Try both encoded and decoded versions of the slug
    // Include meta fields in the request to get custom fields
    const encodedSlug = encodeURIComponent(slug)
    
    // For WordPress.com, custom fields are accessible via meta field
    // For self-hosted WordPress, we may need to explicitly request meta
    // Note: WordPress REST API doesn't expose all meta by default for security
    // Custom fields need to be registered to be accessible via REST API
    let url = `${WORDPRESS_API_URL}/posts?slug=${encodedSlug}&_embed=1`
    
    // If using ACF, we need to include acf fields in the request
    // Note: This requires ACF to REST API plugin or ACF's REST API integration
    // For custom fields, WordPress REST API includes meta by default with proper permissions
    
    console.log('🔍 Fetching post by slug:', { original: slug, encoded: encodedSlug })
    
    let res = await fetch(url, { next: { revalidate: 300 } })
    
    // If not found, try with the original slug (might already be encoded)
    if (!res.ok || res.status === 404) {
      url = `${WORDPRESS_API_URL}/posts?slug=${slug}&_embed=1`
      res = await fetch(url, { next: { revalidate: 300 } })
    }
    
    if (!res.ok) {
      console.error('❌ Post not found:', slug, res.status)
      return null
    }
    
    const arr = await res.json()
    const p = arr?.[0]
    if (!p) {
      console.error('❌ Post not found in response:', slug)
      return null
    }
    
    const contentHtml = p.content?.rendered || ""
    
    // Decode slug if needed
    let decodedSlug = p.slug
    try {
      decodedSlug = decodeURIComponent(p.slug)
    } catch (e) {
      // Keep original if decoding fails
    }
    
    console.log('✅ Post found:', { id: p.id, slug: decodedSlug, title: p.title?.rendered })
    
    // Extract citations from custom fields or ACF
    // Supports both WordPress native meta fields and ACF fields
    // WordPress REST API stores custom fields in the 'meta' object
    // Note: WordPress.com uses 'meta' field, self-hosted may use 'meta' or 'acf'
    let citations: string | undefined = undefined
    
    // Try ACF field first (if ACF is installed with ACF to REST API plugin)
    if (p.acf?.citations) {
      citations = typeof p.acf.citations === 'string' ? p.acf.citations : String(p.acf.citations)
      console.log('✅ Found citations in ACF field')
    } else if (p.acf?.citations_html) {
      citations = p.acf.citations_html
      console.log('✅ Found citations in ACF HTML field')
    }
    // Try WordPress native meta fields (custom fields)
    // WordPress stores custom fields with the key as-is, but some may be prefixed with underscore
    else if (p.meta?._citations) {
      citations = p.meta._citations
      console.log('✅ Found citations in meta._citations')
    } else if (p.meta?.citations) {
      citations = p.meta.citations
      console.log('✅ Found citations in meta.citations')
    }
    // Try custom meta in _embedded format (if meta is embedded)
    else if (p._embedded?.["meta"]?.[0]?.citations) {
      citations = p._embedded.meta[0].citations
      console.log('✅ Found citations in embedded meta')
    }
    // Debug: Log available meta keys to help troubleshoot
    else if (p.meta) {
      console.log('ℹ️ Available meta keys:', Object.keys(p.meta))
      console.log('ℹ️ Meta object:', p.meta)
    } else {
      console.log('ℹ️ No meta object found in post')
    }
    
    return {
      id: p.id,
      slug: decodedSlug,
      title: decodeHtmlEntities(stripHtml(p.title?.rendered || "Untitled")),
      excerpt: (() => {
        let excerpt = decodeHtmlEntities(stripHtml(p.excerpt?.rendered || ""))
        if (excerpt.length > 150) {
          excerpt = excerpt.substring(0, 147).trim() + "..."
        }
        return excerpt
      })(),
      date: new Date(p.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      readTime: estimateReadTime(stripHtml(contentHtml)),
      category: wpPrimaryCategory(p),
      coverImage: wpFeaturedImage(p),
      content: contentHtml,
      tags: wpTags(p),
      citations: citations,
    }
  } catch (error) {
    console.error('❌ Error fetching post by slug:', error)
    return null
  }
}

export async function wpGetCommentsByPostId(postId: number): Promise<WPComment[]> {
  try {
    const url = `${WORDPRESS_API_URL}/comments?post=${postId}&status=approve&orderby=date&order=asc`
    console.log('🔍 Fetching WordPress comments from:', url)
    
    const res = await fetch(url, { 
      next: { revalidate: 300 },
      headers: {
        'Accept': 'application/json',
      }
    })
    
    if (!res.ok) {
      // Comments might not be enabled or available, which is okay
      if (res.status === 404 || res.status === 403) {
        console.log('ℹ️ Comments not available for this post')
        return []
      }
      console.error('❌ WordPress Comments API Error:', {
        status: res.status,
        statusText: res.statusText,
        url
      })
      return []
    }
    
    const data = await res.json()
    
    if (!Array.isArray(data)) {
      console.error('❌ WordPress API returned non-array comments data:', data)
      return []
    }
    
    const comments = data.map((c: any) => ({
      id: c.id,
      authorName: c.author_name || 'Anonymous',
      authorUrl: c.author_url || undefined,
      authorAvatar: c.author_avatar_urls?.['96'] || undefined,
      date: new Date(c.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      content: c.content?.rendered || '',
      parent: c.parent || undefined,
    }))
    
    console.log('✅ Processed comments:', comments.length)
    return comments
  } catch (error) {
    console.error('❌ Error fetching WordPress comments:', error)
    return []
  }
}

