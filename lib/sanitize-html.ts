import sanitizeHtml from "sanitize-html"

// Video/audio embed hosts we trust enough to allow their <iframe>s through.
// Everything else — including a WordPress post or comment body carrying a
// hand-crafted <iframe src="javascript:..."> or pointing at an attacker's
// own page — gets its iframe stripped.
const ALLOWED_EMBED_HOSTS = [
  "www.youtube.com",
  "www.youtube-nocookie.com",
  "player.vimeo.com",
  "open.spotify.com",
]

// WordPress (posts, and comments if that feature is ever wired into the UI)
// is a third-party content source — a compromised WordPress.com account or
// an approved malicious comment shouldn't be able to run script in a
// visitor's browser just because we render its HTML with
// dangerouslySetInnerHTML. Strips <script>, event handler attributes,
// javascript: URLs, and anything outside this allow-list, while keeping
// ordinary rich-text formatting and (allow-listed) video embeds intact.
//
// Pure-JS, no DOM emulation — sanitize-html (unlike DOMPurify's Node build,
// which pulls in jsdom) doesn't break Next.js's build-time page-data
// collection step.
export function sanitizeWpHtml(html: string): string {
  if (!html) return ""
  return sanitizeHtml(html, {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      "img",
      "h1",
      "h2",
      "figure",
      "figcaption",
      "iframe",
      "video",
      "source",
    ],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "*": ["class", "id"],
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "width", "height", "loading", "srcset", "sizes"],
      iframe: ["src", "width", "height", "allow", "allowfullscreen", "frameborder", "title"],
      video: ["src", "controls", "width", "height", "poster"],
      source: ["src", "type"],
    },
    allowedIframeHostnames: ALLOWED_EMBED_HOSTS,
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["http", "https", "data"] },
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }, true),
    },
  })
}
