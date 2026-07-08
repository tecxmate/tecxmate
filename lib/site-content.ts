import { put, list } from "@vercel/blob"
import { company } from "./company"

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

/** Allowed service icons (keys map to lucide-react components in services-section.tsx). */
export const SERVICE_ICONS = ["smartphone", "layout", "brain", "zap", "bot", "server-cog"] as const
export type ServiceIcon = (typeof SERVICE_ICONS)[number]

export type Service = {
  id: string
  icon: ServiceIcon
  title: Localized
  description: Localized
}

export type AboutSection = {
  id: string
  heading: Localized
  paragraphs: Localized[]
  bullets: Localized[]
}

export type Phone = { display: string; tel: string }

export type CompanyInfo = {
  name: string
  legalName: { en: string; vi: string }
  formation: string
  address: { street: string; locality: string; country: string; countryCode: string }
  addressDisplay: Localized
  taxNumber: string
  operatingMarkets: string[]
  contactEmail: string
  phone: { us: Phone; tw: Phone; vn: Phone }
  social: { facebook: string; x: string; instagram: string; linkedin: string; booking: string }
}

export type SeoMetadata = {
  title: string
  description: string
  keywords: string[]
  ogTitle: string
  ogDescription: string
  twitterDescription: string
  twitterCreator: string
}

export const SECTION_KEYS = [
  "hero",
  "problem",
  "economics",
  "proof",
  "technology",
  "process",
  "trust",
  "cta",
  "projects",
  "services",
  "team",
  "blog",
  "about",
  "tecxbook",
] as const
export type SectionKey = (typeof SECTION_KEYS)[number]
export type SectionVisibility = Record<SectionKey, boolean>

export const defaultSectionVisibility: SectionVisibility = {
  hero: true,
  problem: true,
  economics: true,
  proof: true,
  technology: true,
  process: true,
  trust: true,
  cta: true,
  projects: false,
  services: false,
  team: true,
  blog: true,
  about: true,
  tecxbook: true,
}

export type SiteContent = {
  settings: { sections: SectionVisibility }
  team: TeamMember[]
  hero: { title: Localized; subtitle: Localized }
  services: { title: Localized; items: Service[] }
  about: { subtitle: Localized; sections: AboutSection[] }
  company: CompanyInfo
  seo: SeoMetadata
}

const CONTENT_PATHNAME = "site-content/content.json"

export function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim())
}

/** Build a Localized value from a single string (used for current English-only defaults). */
function L(value: string): Localized {
  return { en: value, vi: value, zh: value }
}

/** Build a fully-translated Localized value. */
function M(en: string, vi: string, zh: string): Localized {
  return { en, vi, zh }
}

/** Defaults mirror the current live site so an empty Blob renders identically to today. */
export const defaultContent: SiteContent = {
  settings: {
    sections: { ...defaultSectionVisibility },
  },
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
      id: "andrea",
      name: "Andrea Peretto",
      role: M("Business Developer", "Phát triển kinh doanh", "業務開發"),
      description: L(""),
      photo: "/avatars/peretto_avatar.JPG",
      linkedin: "https://vn.linkedin.com/in/peretto-andrea-53624738",
      twitter: "https://www.tecxmate.com",
      socialIcon: "company",
    },
  ],
  hero: {
    title: M(
      "Your technology partner.",
      "Đối tác công nghệ của bạn.",
      "您的技術夥伴。",
    ),
    subtitle: M(
      "Cutting-edge AI Integration and Development to accelerate your businesses.",
      "Tích hợp và phát triển AI tiên tiến để tăng tốc doanh nghiệp của bạn.",
      "以尖端 AI 整合與開發，加速您的業務成長。",
    ),
  },
  services: {
    title: M("Our Services", "Dịch vụ của chúng tôi", "我們的服務"),
    items: [
      {
        id: "mobile-app-development",
        icon: "smartphone",
        title: M(
          "iOS & Android App Development",
          "Phát triển ứng dụng iOS & Android",
          "iOS 與 Android 應用程式開發",
        ),
        description: M(
          "Native and cross-platform mobile applications built for performance and user experience.",
          "Ứng dụng di động bản địa và đa nền tảng được tối ưu hiệu năng và trải nghiệm người dùng.",
          "兼顧效能與使用者體驗的原生及跨平台行動應用程式。",
        ),
      },
      {
        id: "website-development",
        icon: "layout",
        title: M("Website Development", "Phát triển Website", "網站開發"),
        description: M(
          "Responsive, high-performance websites and modern web applications built to scale.",
          "Website phản hồi nhanh, hiệu năng cao và các ứng dụng web hiện đại có khả năng mở rộng.",
          "具備高響應性、高效能且易於擴展的現代網頁應用程式。",
        ),
      },
      {
        id: "ai-applications",
        icon: "brain",
        title: M("AI Application Development", "Phát triển ứng dụng AI", "AI 應用程式開發"),
        description: M(
          "ML, NLP, and computer vision solutions — from chatbots to predictive analytics.",
          "Giải pháp ML, NLP và thị giác máy tính — từ chatbot đến phân tích dự báo.",
          "機器學習、自然語言處理與電腦視覺方案 — 從聊天機器人到預測分析。",
        ),
      },
      {
        id: "business-automation",
        icon: "zap",
        title: M("Business Automation", "Tự động hóa doanh nghiệp", "業務自動化"),
        description: M(
          "Workflow automation, system integration, and operational streamlining.",
          "Tự động hóa quy trình làm việc, tích hợp hệ thống và tinh gọn vận hành.",
          "工作流程自動化、系統整合與營運流程精簡。",
        ),
      },
      {
        id: "ai-integration",
        icon: "bot",
        title: M("AI Integration & Consulting", "Tư vấn & Tích hợp AI", "AI 整合與諮詢"),
        description: M(
          "AI strategy, tool selection, and hands-on implementation support.",
          "Chiến lược AI, lựa chọn công cụ và hỗ trợ triển khai thực tế.",
          "AI 策略規劃、工具選用及實作支援。",
        ),
      },
      {
        id: "custom-erp",
        icon: "server-cog",
        title: M(
          "Custom ERP & Operations Systems",
          "Hệ thống ERP & Vận hành tùy chỉnh",
          "客製化 ERP 與營運系統",
        ),
        description: M(
          "Lightweight ERP systems built around your actual workflows.",
          "Các hệ thống ERP tinh gọn được xây dựng dựa trên quy trình thực tế của bạn.",
          "根據您的實際工作流程量身打造的輕量化 ERP 系統。",
        ),
      },
    ],
  },
  about: {
    subtitle: L("Empowering SMEs and Founders with premier technology consultancy and solutions"),
    sections: [
      {
        id: "mission",
        heading: L("Our Mission"),
        paragraphs: [
          L(
            "At Tecxmate, we believe that technology should be accessible and transformative for businesses of all sizes. We are an LLC headquartered in Ho Chi Minh City, Vietnam, with operations in Taiwan, the US, and Vietnam. We specialize in delivering cutting-edge technology solutions that help SMEs and startups thrive in the digital age.",
          ),
          L(
            "We incorporate AI into our core operations while leveraging human talents to achieve maximum delivery speed and product quality. Our mission is to give every business the tools they need to stay competitive and benefit from the world of modern technology.",
          ),
        ],
        bullets: [],
      },
      {
        id: "what-we-do",
        heading: L("What We Do"),
        paragraphs: [L("We provide comprehensive technology consultancy and solutions, including:")],
        bullets: [
          L("AI Application Development - Building intelligent applications powered by machine learning, NLP, and computer vision"),
          L("Business Automation - Automating workflows, streamlining operations, and integrating systems"),
          L("AI Chatbot Development - Building chatbots for Line, Messenger, Telegram, and customer service automation"),
          L("Digital Transformation - Helping businesses transform their operations with modern technology"),
        ],
      },
      {
        id: "approach",
        heading: L("Our Approach"),
        paragraphs: [
          L("We combine the power of AI with human expertise to deliver fast, high-quality solutions. Our approach focuses on:"),
        ],
        bullets: [
          L("Fast delivery without compromising quality"),
          L("Innovative solutions tailored to your business needs"),
          L("Cost-effective solutions for SMEs and startups"),
          L("Ongoing support and partnership"),
        ],
      },
      {
        id: "why-choose",
        heading: L("Why Choose Tecxmate"),
        paragraphs: [
          L(
            "We serve clients worldwide with professional, high-quality technology solutions. Whether you're a startup looking to build your first AI application or an established SME seeking to automate operations, we're here to help you build the future.",
          ),
        ],
        bullets: [],
      },
    ],
  },
  company: {
    name: company.name,
    legalName: { ...company.legalName },
    formation: company.formation,
    address: { ...company.address },
    addressDisplay: { ...company.addressDisplay },
    taxNumber: company.taxNumber,
    operatingMarkets: [...company.operatingMarkets],
    contactEmail: company.contactEmail,
    phone: {
      us: { ...company.phone.us },
      tw: { ...company.phone.tw },
      vn: { ...company.phone.vn },
    },
    social: { ...company.social },
  },
  seo: {
    title: "TECXMATE - Premier Technology Partner | AI Software Solutions",
    description:
      "Transform your business with Tecxmate's cutting-edge technology solutions. Expert AI integration, web development, business automation, and digital transformation services. Fast delivery, innovative solutions for SMEs and founders. Book your consultation today.",
    keywords: [
      "technology consultancy",
      "AI development",
      "business automation",
      "web development",
      "startup consulting",
      "SME solutions",
      "digital transformation",
      "software development",
      "AI integration",
      "tech consulting",
      "business technology",
      "blockchain development",
      "mobile app development",
      "enterprise solutions",
    ],
    ogTitle: "TECXMATE - Premier Technology Partner | AI Software Solutions",
    ogDescription:
      "Transform your business with AI-powered solutions, web development, and business automation. Fast delivery, innovative technology consulting for SMEs and founders. Book your free discovery call.",
    twitterDescription:
      "Transform your business with AI-powered solutions, web development, and business automation. Fast delivery, innovative technology consulting.",
    twitterCreator: "@tecxmate",
  },
}

function mergeContent(stored?: Partial<SiteContent>): SiteContent {
  if (!stored) return defaultContent

  return {
    ...defaultContent,
    ...stored,
    company: {
      ...defaultContent.company,
      ...stored.company,
      legalName: {
        ...defaultContent.company.legalName,
        ...stored.company?.legalName,
      },
      address: {
        ...defaultContent.company.address,
        ...stored.company?.address,
      },
      addressDisplay: {
        ...defaultContent.company.addressDisplay,
        ...stored.company?.addressDisplay,
      },
      phone: {
        ...defaultContent.company.phone,
        ...stored.company?.phone,
      },
      social: {
        ...defaultContent.company.social,
        ...stored.company?.social,
      },
      operatingMarkets: stored.company?.operatingMarkets ?? defaultContent.company.operatingMarkets,
    },
    settings: {
      ...defaultContent.settings,
      ...stored.settings,
      sections: {
        ...defaultContent.settings.sections,
        ...stored.settings?.sections,
      },
    },
  }
}

export function isSectionEnabled(content: SiteContent, section: SectionKey): boolean {
  return content.settings.sections[section] !== false
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

/**
 * Read stored content merged over defaults. Falls back to defaults when Blob is empty/unconfigured.
 * Pass `{ revalidate: n }` to ISR-cache the read (used by layout metadata so reading SEO content
 * doesn't force every page dynamic); the default no-store read is for always-fresh consumers.
 */
export async function readContent(opts?: { revalidate?: number }): Promise<SiteContent> {
  const url = await findContentUrl()
  if (!url) return defaultContent
  try {
    const res = await fetch(
      url,
      opts?.revalidate != null ? { next: { revalidate: opts.revalidate } } : { cache: "no-store" },
    )
    if (!res.ok) return defaultContent
    const stored = (await res.json()) as Partial<SiteContent>
    return mergeContent(stored)
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
