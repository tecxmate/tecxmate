import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { checkRateLimit, clientIp } from '@/lib/rate-limit'

// Initialize Redis using environment variables
const redis = Redis.fromEnv()

// Toggle like for a blog post
export async function POST(request: NextRequest) {
  try {
    const { slug, action } = await request.json()

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { error: 'Invalid slug' },
        { status: 400 }
      )
    }

    // A click toggles this once; an unbounded increment otherwise lets
    // anyone script arbitrary like-count inflation. 30/10min per IP is well
    // above normal like/unlike toggling.
    const rate = await checkRateLimit({
      scope: 'blog-likes',
      identity: clientIp(request),
      limit: 30,
      windowSeconds: 600,
    })
    if (!rate.ok) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } },
      )
    }

    const likesKey = `blog:likes:${slug}`
    
    if (action === 'like') {
      // Increment like count
      const likes = await redis.incr(likesKey)
      return NextResponse.json({
        success: true,
        likes,
        slug,
        liked: true
      })
    } else if (action === 'unlike') {
      // Decrement like count (don't go below 0)
      const currentLikes = await redis.get<number>(likesKey) || 0
      if (currentLikes > 0) {
        const likes = await redis.decr(likesKey)
        return NextResponse.json({
          success: true,
          likes: Math.max(0, likes),
          slug,
          liked: false
        })
      }
      return NextResponse.json({
        success: true,
        likes: 0,
        slug,
        liked: false
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "like" or "unlike"' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error toggling like:', error)
    // If Redis isn't configured, return gracefully. Checking the env vars
    // directly (rather than pattern-matching the thrown error's message) is
    // what the intent here actually needs: the SDK's real failure text for
    // a missing URL/token doesn't contain "UPSTASH" at all, so that check
    // never matched and every Redis hiccup — configured or not — was
    // falling through to a hard 500.
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      return NextResponse.json({
        success: true,
        likes: 0,
        slug: '',
        liked: false,
        warning: 'Redis not configured'
      })
    }
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    )
  }
}

// Get like counts for one or multiple posts
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const slug = searchParams.get('slug')
    const slugs = searchParams.get('slugs')?.split(',')

    if (slug) {
      // Return like count for a single post
      const likes = await redis.get<number>(`blog:likes:${slug}`) || 0
      return NextResponse.json({
        slug,
        likes: Number(likes)
      })
    } else if (slugs && slugs.length > 0) {
      // Return like counts for multiple posts
      const result: Record<string, number> = {}
      const keys = slugs.map(s => `blog:likes:${s}`)
      const values = await redis.mget<number[]>(keys)
      
      slugs.forEach((s, i) => {
        result[s] = Number(values[i]) || 0
      })
      return NextResponse.json(result)
    } else {
      // Return empty object
      return NextResponse.json({})
    }
  } catch (error) {
    console.error('Error getting likes:', error)
    // If Redis is not configured, return empty counts gracefully
    const searchParams = request.nextUrl.searchParams
    const slug = searchParams.get('slug')
    const slugs = searchParams.get('slugs')?.split(',')
    
    if (slug) {
      return NextResponse.json({ slug, likes: 0 })
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

