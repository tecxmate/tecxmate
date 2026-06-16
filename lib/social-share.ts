import type { StoredBlogPost } from "./blog-store"

export type SocialShareResult = {
  target: string
  ok: boolean
  status?: number
  error?: string
  response?: unknown
}

type PostizIntegration = {
  id: string
  type: string
}

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://www.tecxmate.com").replace(/\/$/, "")
}

function postUrl(post: StoredBlogPost): string {
  return `${siteUrl()}/blog/${encodeURIComponent(post.slug)}`
}

function publicUrl(pathOrUrl?: string): string | undefined {
  if (!pathOrUrl) return undefined
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) return pathOrUrl
  if (!pathOrUrl.startsWith("/")) return undefined
  return encodeURI(`${siteUrl()}${pathOrUrl}`)
}

function postText(post: StoredBlogPost): string {
  const tags = (post.tags || [])
    .filter((tag) => tag.toLowerCase() !== "en")
    .slice(0, 6)
    .map((tag) => `#${tag.replace(/[^a-zA-Z0-9_]/g, "")}`)
    .filter((tag) => tag.length > 1)
    .join(" ")

  return `${post.title}\n\n${post.excerpt}\n\nRead more: ${postUrl(post)}\n\n${tags}`.trim()
}

function parsePostizIntegrations(): PostizIntegration[] {
  const raw = process.env.POSTIZ_INTEGRATIONS?.trim()
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed.filter((item) => item?.id && item?.type)
    }
  } catch {
    // Fall through to compact comma syntax.
  }

  return raw
    .split(",")
    .map((item) => {
      const [id, type] = item.split(":").map((part) => part.trim())
      return id && type ? { id, type } : null
    })
    .filter((item): item is PostizIntegration => Boolean(item))
}

function postizSettings(type: string, post: StoredBlogPost): Record<string, unknown> {
  if (type === "x") return { __type: "x", who_can_reply_post: "everyone" }
  if (type === "facebook") return { __type: "facebook", url: postUrl(post) }
  if (type === "instagram" || type === "instagram-standalone") return { __type: type, post_type: "post" }
  if (type === "threads") return { __type: "threads" }
  if (type === "linkedin" || type === "linkedin-page") return { __type: type }
  return { __type: type }
}

async function shareToPostiz(post: StoredBlogPost): Promise<SocialShareResult> {
  const apiKey = process.env.POSTIZ_API_KEY?.trim()
  const baseUrl = (process.env.POSTIZ_API_URL || "https://api.postiz.com/public/v1").replace(/\/$/, "")
  const integrations = parsePostizIntegrations()

  if (!apiKey || integrations.length === 0) {
    return { target: "postiz", ok: true, status: 204 }
  }

  const mediaUrl = publicUrl(process.env.POSTIZ_DEFAULT_MEDIA_URL || post.coverImage)
  const image = mediaUrl ? [{ path: mediaUrl }] : []

  const payload = {
    type: process.env.POSTIZ_POST_TYPE || "now",
    date: new Date().toISOString(),
    shortLink: false,
    tags: [],
    posts: integrations.map((integration) => ({
      integration: { id: integration.id },
      value: [
        {
          content: postText(post),
          image,
        },
      ],
      settings: postizSettings(integration.type, post),
    })),
  }

  try {
    const res = await fetch(`${baseUrl}/posts`, {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
    const text = await res.text()
    let response: unknown = null
    try {
      response = text ? JSON.parse(text) : null
    } catch {
      response = text
    }

    return {
      target: "postiz",
      ok: res.ok,
      status: res.status,
      response,
      error: res.ok ? undefined : text,
    }
  } catch (error) {
    return {
      target: "postiz",
      ok: false,
      error: error instanceof Error ? error.message : "Postiz share failed",
    }
  }
}

async function shareToLine(post: StoredBlogPost): Promise<SocialShareResult> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN?.trim()
  if (!token) return { target: "line", ok: true, status: 204 }

  const targetUserId = process.env.LINE_TARGET_USER_ID?.trim()
  const endpoint = targetUserId
    ? "https://api.line.me/v2/bot/message/push"
    : "https://api.line.me/v2/bot/message/broadcast"
  const body = targetUserId
    ? { to: targetUserId, messages: [{ type: "text", text: postText(post).slice(0, 5000) }] }
    : { messages: [{ type: "text", text: postText(post).slice(0, 5000) }] }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
    const text = await res.text()
    let response: unknown = null
    try {
      response = text ? JSON.parse(text) : null
    } catch {
      response = text
    }

    return {
      target: "line",
      ok: res.ok,
      status: res.status,
      response,
      error: res.ok ? undefined : text,
    }
  } catch (error) {
    return {
      target: "line",
      ok: false,
      error: error instanceof Error ? error.message : "LINE share failed",
    }
  }
}

export async function shareBlogPostToSocials(post: StoredBlogPost): Promise<SocialShareResult[]> {
  if (process.env.SOCIAL_SHARE_ENABLED !== "true") {
    return []
  }

  const targets = (process.env.SOCIAL_SHARE_TARGETS || "postiz,line")
    .split(",")
    .map((target) => target.trim().toLowerCase())
    .filter(Boolean)

  const results: SocialShareResult[] = []
  if (targets.includes("postiz")) results.push(await shareToPostiz(post))
  if (targets.includes("line")) results.push(await shareToLine(post))
  return results
}
