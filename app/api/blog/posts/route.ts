import { NextResponse } from "next/server"
import { wpGetAllPosts } from "@/lib/wordpress"

// Fallback data in case WordPress API fails
const fallbackPosts = [
  {
    id: "fallback-1",
    slug: "web-design-trends",
    title: "Web Design Trends to Watch",
    excerpt: "Explore the latest web design trends that are shaping the digital landscape this year.",
    date: "January 15, 2023",
    readTime: "5 min read",
    category: "Design",
    coverImage: "/placeholder.svg?height=200&width=400",
  },
  {
    id: "fallback-2",
    slug: "improving-website-speed",
    title: "Improving Website Loading Speed",
    excerpt: "Learn practical tips and techniques to optimize your website's performance.",
    date: "February 3, 2023",
    readTime: "7 min read",
    category: "Performance",
    coverImage: "/placeholder.svg?height=200&width=400",
  },
  {
    id: "fallback-3",
    slug: "mobile-first-design",
    title: "Mobile-First Design Importance",
    excerpt: "With mobile traffic continuing to rise, designing for mobile-first is no longer optional.",
    date: "March 12, 2023",
    readTime: "6 min read",
    category: "Design",
    coverImage: "/placeholder.svg?height=200&width=400",
  },
]

export async function GET(request: Request) {
  try {
    console.log('📡 API route /api/blog/posts called')
    const url = new URL(request.url)
    const categoryParam = url.searchParams.get("lang")?.toLowerCase() || "en"
    let posts = await wpGetAllPosts(categoryParam)
    console.log(`📡 Posts fetched for ${categoryParam}:`, posts.length)
    
    // Fallback to English if no posts found for the requested language
    if (categoryParam !== 'en' && (!posts || posts.length === 0)) {
      console.log(`⚠️ No posts found for ${categoryParam}, falling back to en`)
      posts = await wpGetAllPosts('en')
    }
    
    if (posts && posts.length > 0) {
      console.log('✅ Returning WordPress posts:', posts.length)
      return NextResponse.json(posts)
    }
    
    console.log('⚠️ No WordPress posts found, returning fallback posts')
    return NextResponse.json(fallbackPosts)
  } catch (error) {
    console.error("❌ API route error:", error)
    return NextResponse.json(fallbackPosts)
  }
}
