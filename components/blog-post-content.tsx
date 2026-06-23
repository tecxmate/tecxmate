"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, ArrowLeft, Star, Facebook, Twitter, Linkedin, Link as LinkIcon, Check, Eye } from "lucide-react"
import Link from "next/link"
import type { WPBlogPost as BlogPost } from "@/lib/wordpress"
import React from "react"
import { useRouter } from "next/navigation"
import { RelatedPosts } from "@/components/related-posts"
import { BlogSidebar } from "@/components/blog-sidebar"
import { BlogTags } from "@/components/blog-tags"
import { BlogCitations } from "@/components/blog-citations"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { trackBlogPostView } from "@/lib/keyword-tracking"

interface BlogPostContentProps {
  slug: string
}

export function BlogPostContent({ slug }: BlogPostContentProps) {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState<number>(0)
  const [linkCopied, setLinkCopied] = useState(false)
  const [views, setViews] = useState<number>(0)
  const [isLiking, setIsLiking] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const getPostUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/blog/${slug}`
    }
    return ''
  }

  const shareToFacebook = () => {
    const postUrl = getPostUrl()
    if (!postUrl) return
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`
    window.open(url, '_blank', 'width=600,height=400')
  }

  const shareToTwitter = () => {
    const postUrl = getPostUrl()
    if (!postUrl) return
    const postTitle = post?.title || ''
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(postTitle)}`
    window.open(url, '_blank', 'width=600,height=400')
  }

  const shareToLinkedIn = () => {
    const postUrl = getPostUrl()
    if (!postUrl) return
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`
    window.open(url, '_blank', 'width=600,height=400')
  }

  const copyToClipboard = async () => {
    const postUrl = getPostUrl()
    if (!postUrl) return
    try {
      await navigator.clipboard.writeText(postUrl)
      setLinkCopied(true)
      toast({
        title: "Link copied!",
        description: "The blog post link has been copied to your clipboard.",
      })
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setLinkCopied(false)
      }, 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      })
    }
  }

  // Track view when post is loaded
  useEffect(() => {
    async function trackView() {
      try {
        const response = await fetch('/api/blog/views', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ slug }),
        })
        
        if (response.ok) {
          const data = await response.json()
          setViews(data.views || 0)
        }
      } catch (err) {
        console.error('Error tracking view:', err)
      }
    }

    // Only track view once per page load
    trackView()
  }, [slug])

  // Track blog post view for keyword analysis
  useEffect(() => {
    if (post) {
      trackBlogPostView(slug, post.title, post.category, post.tags)
    }
  }, [post, slug])

  // Fetch view count on mount
  useEffect(() => {
    async function fetchViews() {
      try {
        const response = await fetch(`/api/blog/views?slug=${encodeURIComponent(slug)}`)
        if (response.ok) {
          const data = await response.json()
          setViews(data.views || 0)
        }
      } catch (err) {
        console.error('Error fetching views:', err)
      }
    }

    fetchViews()
  }, [slug])

  // Fetch like count and check if user has liked (using localStorage)
  useEffect(() => {
    async function fetchLikes() {
      try {
        const response = await fetch(`/api/blog/likes?slug=${encodeURIComponent(slug)}`)
        if (response.ok) {
          const data = await response.json()
          setLikes(data.likes || 0)
          
          // Check if user has liked this post (stored in localStorage)
          if (typeof window !== 'undefined') {
            const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]')
            setLiked(likedPosts.includes(slug))
          }
        }
      } catch (err) {
        console.error('Error fetching likes:', err)
      }
    }

    fetchLikes()
  }, [slug])

  // Handle like/unlike
  const handleLike = async () => {
    if (isLiking) return
    
    setIsLiking(true)
    const action = liked ? 'unlike' : 'like'
    
    try {
      const response = await fetch('/api/blog/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug, action }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setLikes(data.likes || 0)
        setLiked(data.liked)
        
        // Store liked state in localStorage
        if (typeof window !== 'undefined') {
          const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]')
          if (data.liked) {
            if (!likedPosts.includes(slug)) {
              likedPosts.push(slug)
            }
          } else {
            const index = likedPosts.indexOf(slug)
            if (index > -1) {
              likedPosts.splice(index, 1)
            }
          }
          localStorage.setItem('likedPosts', JSON.stringify(likedPosts))
        }
      } else {
        toast({
          title: "Failed to like post",
          description: "Please try again later.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error('Error toggling like:', err)
      toast({
        title: "Failed to like post",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLiking(false)
    }
  }

  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await fetch(`/api/blog/post/${slug}`)

        if (!response.ok) {
          if (response.status === 404) {
            router.push("/blog/not-found")
            return
          }
          throw new Error(`Failed to fetch post: ${response.status}`)
        }

        const data = await response.json()
        setPost(data)
      } catch (err) {
        console.error("Error fetching blog post:", err)
        setError("Failed to load blog post. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [slug, router])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="container px-4 py-12 md:px-6 md:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-lg bg-red-50 p-6 text-center text-red-800">
            <h3 className="mb-2 text-lg font-semibold">Error</h3>
            <p>{error || "Failed to load blog post"}</p>
            <Link href="/blog" className="mt-4 inline-block text-primary">
              Back to Blog
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <article className="overflow-x-hidden w-full">
      <div className="container px-4 py-8 md:px-6 md:py-12 w-full max-w-full">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Main Content - Left side */}
          <div className="md:col-span-3">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-6">
              <Link href="/blog" className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-primary transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back to all posts
              </Link>
            </nav>

            {/* WordPress-style Header */}
            <header className="mb-8 pb-8 border-b border-gray-200">
              {/* Category */}
              <div className="mb-4">
                <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  {post.category}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-6">
                {post.title}
              </h1>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{post.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{post.readTime}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{views.toLocaleString()} {views === 1 ? 'view' : 'views'}</span>
                </div>
              </div>
            </header>

            {/* Hero cover image */}
            {post.coverImage && (
              <figure className="mb-8 overflow-hidden rounded-xl border border-gray-100 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-auto max-h-[480px] object-cover"
                  loading="eager"
                />
              </figure>
            )}

            {/* Main Content */}
            <div className="overflow-x-hidden">
              <div
                className="wp-content prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-code:text-primary prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-img:rounded-lg prose-img:shadow-md prose-img:w-full" 
                dangerouslySetInnerHTML={{ __html: post.content || "" }} 
              />
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-8">
                <BlogTags tags={post.tags} />
              </div>
            )}

            {/* Citations Section */}
            <BlogCitations citations={post.citations} />

            {/* Like and Share Buttons */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex items-center gap-4 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLike}
                  disabled={isLiking}
                  className={`flex items-center gap-2 ${liked ? 'text-primary border-primary bg-primary/5' : ''}`}
                >
                  <Star className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                  {isLiking ? '...' : liked ? 'Liked' : 'Like'}
                  {likes > 0 && (
                    <span className="ml-1 text-xs">({likes.toLocaleString()})</span>
                  )}
                </Button>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm text-gray-600 font-medium">Share to:</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={shareToFacebook}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      aria-label="Share on Facebook"
                      title="Share on Facebook"
                    >
                      <Facebook className="h-5 w-5 text-blue-600" />
                    </button>
                    <button
                      onClick={shareToTwitter}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      aria-label="Share on Twitter"
                      title="Share on Twitter"
                    >
                      <Twitter className="h-5 w-5 text-blue-400" />
                    </button>
                    <button
                      onClick={shareToLinkedIn}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      aria-label="Share on LinkedIn"
                      title="Share on LinkedIn"
                    >
                      <Linkedin className="h-5 w-5 text-blue-700" />
                    </button>
                    <button
                      onClick={copyToClipboard}
                      className={`p-2 rounded-full transition-all duration-300 ${
                        linkCopied 
                          ? 'bg-green-100 hover:bg-green-100' 
                          : 'hover:bg-gray-100'
                      }`}
                      aria-label={linkCopied ? "Link copied!" : "Copy link"}
                      title={linkCopied ? "Link copied!" : "Copy link"}
                    >
                      <div className="relative h-5 w-5 flex items-center justify-center">
                        <Check 
                          className={`h-5 w-5 text-green-600 absolute transition-all duration-200 ${
                            linkCopied 
                              ? 'opacity-100 scale-100 rotate-0' 
                              : 'opacity-0 scale-50 rotate-90'
                          }`}
                        />
                        <LinkIcon 
                          className={`h-5 w-5 text-gray-600 absolute transition-all duration-200 ${
                            linkCopied 
                              ? 'opacity-0 scale-50 rotate-90' 
                              : 'opacity-100 scale-100 rotate-0'
                          }`}
                        />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Right side */}
          <div className="md:col-span-1">
            <BlogSidebar currentPostSlug={post.slug} />
          </div>
        </div>
      </div>
      
      <RelatedPosts 
        currentPostSlug={post.slug} 
        currentCategory={post.category}
        currentTags={post.tags}
      />
    </article>
  )
}
