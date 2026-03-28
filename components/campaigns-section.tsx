"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Calendar, Clock, ArrowRight } from "lucide-react"
import type { WPBlogPost as BlogPost } from "@/lib/wordpress"

export function CampaignsSection() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Defer data fetching significantly to reduce TBT - load after initial render
    let mounted = true
    const fetchPosts = async () => {
      try {
        // Use longer delay to ensure page is interactive first
        await new Promise(resolve => setTimeout(resolve, 500))
        
        if (!mounted) return
        
        const response = await fetch("/api/blog/posts")
        if (!response.ok) {
          throw new Error(`Failed to fetch posts: ${response.status}`)
        }
        const data = await response.json()
        if (mounted) {
          setBlogPosts(data.slice(0, 6))
          setLoading(false)
        }
      } catch (err) {
        if (mounted) {
          console.error("Error fetching blog posts:", err)
          setBlogPosts([])
          setLoading(false)
        }
      }
    }
    
    // Use requestIdleCallback if available, otherwise delay longer
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(fetchPosts, { timeout: 3000 })
    } else {
      setTimeout(fetchPosts, 1000)
    }
    
    return () => {
      mounted = false
    }
  }, [])

  if (loading) {
    return (
      <section id="campaigns" className="bg-gray-50/80 py-24 md:py-28 lg:py-32">
        <div className="container px-4 md:px-6 max-w-7xl">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="campaigns" className="bg-gray-50/80 py-24 md:py-28 lg:py-32">
      <div className="container px-4 md:px-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl font-semibold md:text-4xl lg:text-5xl mb-4 tracking-tight text-gray-900">
            News & Insights
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            Stay updated with our latest articles, insights, and industry news.
          </p>
        </div>

        {/* Blog Posts Grid */}
        {blogPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group block rounded-none border border-gray-200 bg-white shadow-sm overflow-hidden h-full hover:border-primary hover:shadow-md transition-all duration-300"
              >
                <div className="aspect-video w-full overflow-hidden bg-gray-100 relative">
                  <Image
                    src={post.coverImage || "/placeholder.svg?height=200&width=400"}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    quality={75}
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <div className="mb-2">
                    <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {post.category}
                    </span>
                  </div>
                  <div className="mb-3 flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{post.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {post.excerpt}
                  </p>
                  <div className="inline-flex items-center text-sm font-medium text-primary">
                    <span>Read More</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No blog posts available at the moment.</p>
            <Link href="/blog" className="mt-4 inline-block text-primary hover:underline">
              Visit our blog
            </Link>
          </div>
        )}

        {/* View All Link */}
        {blogPosts.length > 0 && (
          <div className="text-center mt-12">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-medium hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg"
            >
              View All Articles
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
