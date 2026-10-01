import { NextResponse } from "next/server"
import { wpGetAllPosts } from "@/lib/wordpress"
import { isSectionEnabled, readContent } from "@/lib/site-content"

// `X-Blog-Source: unavailable` tells the client the difference between "your
// filters matched nothing" and "we have no posts to serve right now", which an
// empty array alone cannot express. The client shows the being-improved notice
// for the second case.
//
// This route used to answer with three invented placeholder articles ("Web Design
// Trends to Watch" and friends) whenever WordPress returned nothing. They looked
// like real posts, carried placeholder.svg covers, and linked to slugs that do not
// exist — so a reader who clicked one landed on a 404. An empty list with an
// honest notice is better than fabricated content.
const UNAVAILABLE = { headers: { "X-Blog-Source": "unavailable" } }

export async function GET(request: Request) {
  try {
    const content = await readContent({ revalidate: 60 })
    if (!isSectionEnabled(content, "blog")) {
      return NextResponse.json([], { status: 404 })
    }

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
      console.log('✅ Returning posts:', posts.length)
      return NextResponse.json(posts)
    }

    console.warn('⚠️ No posts available from WordPress or local store — reporting unavailable')
    return NextResponse.json([], UNAVAILABLE)
  } catch (error) {
    console.error("❌ API route error:", error)
    return NextResponse.json([], UNAVAILABLE)
  }
}
