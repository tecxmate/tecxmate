import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { checkRateLimit, clientIp } from '@/lib/rate-limit'

// Initialize Redis using environment variables
// Redis.fromEnv() automatically reads UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
const redis = Redis.fromEnv()

// Track a view for a blog post
export async function POST(request: NextRequest) {
  let slug: unknown
  try {
    ;({ slug } = await request.json())

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { error: 'Invalid slug' },
        { status: 400 }
      )
    }

    // Fires once per page load, but an unbounded increment lets anyone
    // script arbitrary view-count inflation. 60/10min per IP comfortably
    // covers a reader browsing many posts while blocking spam.
    const rate = await checkRateLimit({
      scope: 'blog-views',
      identity: clientIp(request),
      limit: 60,
      windowSeconds: 600,
    })
    if (!rate.ok) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } },
      )
    }

    const key = `blog:views:${slug}`
    
    // Increment view count atomically
    const views = await redis.incr(key)

    return NextResponse.json({
      success: true,
      views,
      slug
    })
  } catch (error) {
    console.error('Error tracking view:', error)
    // If Redis isn't configured, return 0 views gracefully. Checking the env
    // vars directly (rather than pattern-matching the thrown error's
    // message) is what the intent here actually needs: the SDK's real
    // failure text for a missing URL/token doesn't contain "UPSTASH" at
    // all, so that check never matched and every Redis hiccup — configured
    // or not — was falling through to a hard 500.
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      return NextResponse.json({
        success: true,
        views: 0,
        slug,
        warning: 'Redis not configured'
      })
    }
    return NextResponse.json(
      { error: 'Failed to track view' },
      { status: 500 }
    )
  }
}

// Get view counts for one or multiple posts
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const slug = searchParams.get('slug')
    const slugs = searchParams.get('slugs')?.split(',')

    if (slug) {
      // Return view count for a single post
      const views = await redis.get<number>(`blog:views:${slug}`) || 0
      return NextResponse.json({
        slug,
        views: Number(views)
      })
    } else if (slugs && slugs.length > 0) {
      // Return view counts for multiple posts
      const result: Record<string, number> = {}
      const keys = slugs.map(s => `blog:views:${s}`)
      const values = await redis.mget<number[]>(keys)
      
      slugs.forEach((s, i) => {
        result[s] = Number(values[i]) || 0
      })
      return NextResponse.json(result)
    } else {
      // Return empty object - getting all keys with pattern matching
      // would require scanning, which is expensive
      // Views will populate as posts are viewed
      return NextResponse.json({})
    }
  } catch (error) {
    console.error('Error getting views:', error)
    // If Redis is not configured, return empty counts gracefully
    const searchParams = request.nextUrl.searchParams
    const slug = searchParams.get('slug')
    const slugs = searchParams.get('slugs')?.split(',')
    
    if (slug) {
      return NextResponse.json({ slug, views: 0 })
    } else if (slugs && slugs.length > 0) {
      const result: Record<string, number> = {}
      slugs.forEach(s => {
        result[s] = 0
      })
      return NextResponse.json(result)
    }
    return NextResponse.json({})
  }
}
