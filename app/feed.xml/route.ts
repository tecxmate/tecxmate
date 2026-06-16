import { wpGetAllPosts } from "@/lib/wordpress"
import { isSectionEnabled, readContent } from "@/lib/site-content"

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tecxmate.com"
  const content = await readContent({ revalidate: 60 })
  if (!isSectionEnabled(content, "blog")) {
    return new Response("Blog feed is disabled.", { status: 404 })
  }

  const posts = await wpGetAllPosts()

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Tecxmate Blog</title>
    <description>Insights, tutorials, and updates from our team of technology consultancy experts</description>
    <link>${baseUrl}/blog</link>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <pubDate>${new Date().toUTCString()}</pubDate>
    <ttl>60</ttl>
    <image>
      <url>${baseUrl}/tecxmate-logo-cropped.png</url>
      <title>Tecxmate Blog</title>
      <link>${baseUrl}/blog</link>
    </image>
    ${posts.map((post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.excerpt}]]></description>
      <link>${baseUrl}/blog/${encodeURIComponent(post.slug)}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${encodeURIComponent(post.slug)}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <category><![CDATA[${post.category}]]></category>
      ${post.coverImage ? `<enclosure url="${post.coverImage}" type="image/jpeg"/>` : ''}
    </item>
    `).join('')}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
