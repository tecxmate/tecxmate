import { put, list } from "@vercel/blob"

export type Locale = "en" | "vi" | "zh"
export type Localized = Record<Locale, string>

export type TeamMember = {
  id: string
  name: string
  role: Localized
  description: Localized
  photo: string
  linkedin: string
  twitter: string
  socialIcon: "academic" | "company"
}

export type SiteContent = {
  team: TeamMember[]
}

const CONTENT_PATHNAME = "site-content/content.json"

export function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim())
}

/** Build a Localized value from a single string (used for current English-only defaults). */
function L(value: string): Localized {
  return { en: value, vi: value, zh: value }
}

/** Defaults mirror the current live site so an empty Blob renders identically to today. */
export const defaultContent: SiteContent = {
  team: [
    {
      id: "nikolas",
      name: "Nikolas Doan 段皇方",
      role: L("CEO & CFO"),
      description: L("MSc AI/Robotics (NTU, exp. '26). Former Google Cloud Startups. CEO TECXMATE.COM"),
      photo: "/avatars/niko_ava_color.jpg",
      linkedin: "https://www.linkedin.com/in/nikolasdoan/",
      twitter:
        "https://scholar.google.com/citations?hl=en&view_op=list_works&gmla=AH8HC4wBT4T5k1ixLLhNjPNv_RVi-PwijNu8oMXqf4mh7nL21PUT5zluCMjJkZyOBmcdy1_51pRTnYe7erhljl_XOl2nQ3XXV8TW7isW6-0&user=ffn9iV8AAAAJ",
      socialIcon: "academic",
    },
    {
      id: "brian",
      name: "Brian Nguyen 阮文貴",
      role: L("CTO & COO"),
      description: L(
        "MS Gamification Engineering (NTUST, exp. '27). Built 3+ apps on App Store. Specialist in game mechanics for learning.",
      ),
      photo: "/avatars/brian_avatar.png",
      linkedin: "https://www.linkedin.com/in/brian-nguyen-587825235/",
      twitter: "https://www.tecxmate.com",
      socialIcon: "company",
    },
    {
      id: "lynn",
      name: "Lynn Ta 謝宛伶",
      role: L("Project Manager"),
      description: L(""),
      photo: "/avatars/lynn_avatar.JPG",
      linkedin: "https://www.linkedin.com/in/uyen-linh-ta-a970b1188/",
      twitter: "",
      socialIcon: "academic",
    },
    {
      id: "jane",
      name: "Jane Liu 劉美娟",
      role: L("Creative Director"),
      description: L("Creative director with expertise in UI/UX design and brand identity development."),
      photo: "/avatars/jane_avatar.jpeg",
      linkedin: "https://www.linkedin.com/in/jane-liu/",
      twitter: "https://www.tecxmate.com",
      socialIcon: "academic",
    },
  ],
}

async function findContentUrl(): Promise<string | null> {
  if (!isBlobConfigured()) return null
  try {
    const { blobs } = await list({ prefix: CONTENT_PATHNAME, limit: 1 })
    return blobs[0]?.url ?? null
  } catch {
    return null
  }
}

/** Read stored content merged over defaults. Falls back to defaults when Blob is empty/unconfigured. */
export async function readContent(): Promise<SiteContent> {
  const url = await findContentUrl()
  if (!url) return defaultContent
  try {
    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) return defaultContent
    const stored = (await res.json()) as Partial<SiteContent>
    return { ...defaultContent, ...stored }
  } catch {
    return defaultContent
  }
}

export async function writeContent(content: SiteContent): Promise<void> {
  if (!isBlobConfigured()) {
    throw new Error("BLOB storage is not configured: BLOB_READ_WRITE_TOKEN is missing.")
  }
  await put(CONTENT_PATHNAME, JSON.stringify(content), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 60,
  })
}

/** Upload an image (team avatar, etc.) to Blob and return its public URL. */
export async function uploadImage(prefix: string, body: Blob): Promise<{ url: string }> {
  if (!isBlobConfigured()) {
    throw new Error("BLOB storage is not configured: BLOB_READ_WRITE_TOKEN is missing.")
  }
  const ext = body.type.includes("png")
    ? "png"
    : body.type.includes("webp")
      ? "webp"
      : body.type.includes("svg")
        ? "svg"
        : "jpg"
  const pathname = `site-content/images/${prefix}-${Date.now()}.${ext}`
  const result = await put(pathname, body, {
    access: "public",
    contentType: body.type || "image/jpeg",
    addRandomSuffix: false,
    allowOverwrite: true,
  })
  return { url: result.url }
}
