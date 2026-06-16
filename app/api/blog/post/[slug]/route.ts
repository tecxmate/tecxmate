import { NextResponse } from "next/server"
import { wpGetPostBySlug } from "@/lib/wordpress"
import { isSectionEnabled, readContent } from "@/lib/site-content"

// Fallback data for specific posts
const getFallbackPost = (slug: string) => {
  return {
    id: `fallback-${slug}`,
    slug: slug,
    title: "Sample Blog Post",
    excerpt: "This is a sample blog post that appears when the WordPress API is unavailable.",
    date: "January 1, 2023",
    readTime: "5 min read",
    category: "General",
    coverImage: "/placeholder.svg?height=600&width=1200",
    content:
      "# Sample Content\n\nThis is a sample blog post content. The actual content could not be loaded from WordPress.\n\n## Why am I seeing this?\n\nThis could be due to:\n- WordPress API connection issues\n- Missing or incorrect environment variables\n- WordPress site configuration issues\n\nPlease check your WordPress integration setup and try again later.",
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const content = await readContent({ revalidate: 60 })
    if (!isSectionEnabled(content, "blog")) {
      return NextResponse.json({ error: "Blog is disabled" }, { status: 404 })
    }

    const { slug } = await params
    const post = await wpGetPostBySlug(slug)

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error("API route error:", error)
    try {
      const { slug } = await params
      return NextResponse.json(getFallbackPost(slug))
    } catch {
      return NextResponse.json(getFallbackPost("unknown"))
    }
  }
}
