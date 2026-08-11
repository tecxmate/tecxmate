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

export type ChatbotQuickQuestion = {
  id: string
  label: Localized
}

export type ChatbotConfig = {
  enabled: boolean
  memoryEnabled: boolean
  title: Localized
  subtitle: Localized
  greeting: Localized
  placeholder: Localized
  systemPrompt: Localized
  knowledge: Localized
  quickQuestions: ChatbotQuickQuestion[]
  escalation: {
    primaryChannel: "line"
    contactEmail: string
    lineLabel: string
    lineUrl: string
    message: Localized
  }
  limits: {
    retainDays: number
    maxInputChars: number
    maxMessagesPerHour: number
  }
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
  "stories",
  "products",
  "about",
  "tecxbook",
] as const
export type SectionKey = (typeof SECTION_KEYS)[number]

/**
 * Homepage sections in their default top-to-bottom order. Only these are reorderable —
 * the remaining SECTION_KEYS are navigation/standalone-page toggles.
 */
export const HOMEPAGE_SECTION_KEYS = [
  "hero",
  "stories",
  "team",
  "products",
  "proof",
  "economics",
  "problem",
  "technology",
  "process",
  "blog",
  "cta",
] as const
export type HomepageSectionKey = (typeof HOMEPAGE_SECTION_KEYS)[number]
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
  stories: true,
  // Temporarily off. Turn it back on in Admin > Visibility — no deploy needed,
  // since a stored value overrides this default.
  products: false,
  about: true,
  tecxbook: true,
}

export type SiteContent = {
  settings: { sections: SectionVisibility; homepageOrder?: HomepageSectionKey[] }
  team: TeamMember[]
  hero: { title: Localized; subtitle: Localized; cta: { label: Localized; url: string } }
  services: { title: Localized; items: Service[] }
  chatbot: ChatbotConfig
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
    homepageOrder: [...HOMEPAGE_SECTION_KEYS],
  },
  team: [
    {
      id: "nikolas",
      name: "Nikolas Doan 段皇方",
      role: L("CEO & CFO"),
      description: M(
        "MSc AI/Robotics (NTU, exp. '26). Former Google Cloud Startups. CEO TECXMATE.COM",
        "Thạc sĩ AI/Robotics (NTU, dự kiến '26). Cựu Google Cloud Startups. CEO TECXMATE.COM",
        "NTU 人工智慧／機器人碩士（預計 2026 年取得）。前 Google Cloud Startups。TECXMATE.COM 執行長",
      ),
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
      description: M(
        "MS Gamification Engineering (NTUST, exp. '27). Built 3+ apps on App Store. Specialist in game mechanics for learning.",
        "Thạc sĩ Kỹ thuật Game hóa (NTUST, dự kiến '27). Đã phát hành hơn 3 ứng dụng trên App Store. Chuyên gia về cơ chế game ứng dụng vào học tập.",
        "NTUST 遊戲化工程碩士（預計 2027 年取得）。已在 App Store 推出 3 款以上應用程式。專長為學習導向的遊戲機制。",
      ),
      photo: "/avatars/brian_avatar.png",
      linkedin: "https://www.linkedin.com/in/brian-nguyen-587825235/",
      twitter: "https://www.tecxmate.com",
      socialIcon: "company",
    },
    {
      id: "lynn",
      name: "Lynn Ta 謝宛伶",
      role: M("Project Manager", "Quản lý dự án", "專案經理"),
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
      "Technology unlocks many businesses potential. Let's explore what's possible!",
      "Công nghệ có thể mở ra tiềm năng thật sự cho doanh nghiệp bạn. Hãy cùng khám phá.",
      "科技能為您的企業打開真正的潛力。一起來探索。",
    ),
    cta: {
      label: M("Book a consultation call", "Đặt lịch tư vấn", "預約諮詢通話"),
      url: "https://cal.com/nikolasdoan/30min",
    },
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
  chatbot: {
    enabled: true,
    memoryEnabled: true,
    title: M("Tecxmate Assistant", "Trợ lý Tecxmate", "Tecxmate 助理"),
    subtitle: M("Online", "Trực tuyến", "線上"),
    greeting: M(
      "Hi! Tell me what you want to build, automate, or clarify. I can answer in any language.",
      "Chào bạn! Hãy cho tôi biết bạn muốn xây dựng, tự động hóa hoặc cần làm rõ điều gì. Tôi có thể trả lời bằng bất kỳ ngôn ngữ nào.",
      "您好！請告訴我您想打造、導入自動化，或想釐清的問題。我可以用任何語言回答。",
    ),
    placeholder: M("Ask about Tecxmate services...", "Hỏi về dịch vụ Tecxmate...", "詢問 Tecxmate 服務..."),
    systemPrompt: M(
      [
        "You are Tecxmate's website support assistant.",
        "Answer prospective customers clearly and concisely.",
        "Use the same language as the customer unless they ask otherwise.",
        "Use only the supplied Tecxmate knowledge and public website context for company-specific claims.",
        "If you are unsure, say so and offer to connect the customer to LINE.",
        "Do not invent pricing, delivery dates, client names, legal guarantees, or private company details.",
        "Only ask for contact information if the customer volunteers to be contacted or asks for a human follow-up.",
        "Escalate to a human when the customer asks for a person, asks for a quote/proposal, gives contact details, reports dissatisfaction, or asks something you cannot answer well.",
      ].join("\n"),
      [
        "Bạn là trợ lý hỗ trợ khách hàng trên website của Tecxmate.",
        "Trả lời khách hàng tiềm năng rõ ràng và ngắn gọn.",
        "Dùng cùng ngôn ngữ với khách hàng trừ khi họ yêu cầu khác.",
        "Chỉ dùng kiến thức Tecxmate được cung cấp và nội dung công khai trên website cho các thông tin riêng về công ty.",
        "Nếu không chắc, hãy nói rõ và đề nghị kết nối khách hàng qua LINE.",
        "Không tự bịa giá, thời gian giao hàng, tên khách hàng, cam kết pháp lý hoặc thông tin riêng của công ty.",
        "Chỉ hỏi thông tin liên hệ nếu khách hàng tự nguyện để lại hoặc yêu cầu người thật liên hệ.",
        "Chuyển cho người thật khi khách yêu cầu, hỏi báo giá/đề xuất, để lại thông tin liên hệ, không hài lòng, hoặc hỏi điều bạn không trả lời tốt.",
      ].join("\n"),
      [
        "你是 Tecxmate 網站的客服助理。",
        "清楚、精簡地回答潛在客戶。",
        "除非客戶要求，否則使用客戶目前使用的語言。",
        "公司相關資訊只能依據提供的 Tecxmate 知識與公開網站內容。",
        "如果不確定，請坦白說明，並提供轉接 LINE 的選項。",
        "不要編造價格、交付日期、客戶名稱、法律保證或公司內部資訊。",
        "只有在客戶主動留下資料或要求真人跟進時，才詢問聯絡資訊。",
        "當客戶要求真人、詢問報價/提案、留下聯絡資料、表示不滿，或詢問你無法妥善回答的內容時，請轉接真人。",
      ].join("\n"),
    ),
    knowledge: M(
      "Tecxmate provides senior AI and software delivery for SMEs: mobile apps, websites, AI applications, automation, chatbots, voice AI, cloud infrastructure, and support. The first consultation can be free. Primary contact channels are LINE, WhatsApp, email, and a 30-minute booking link.",
      "Tecxmate cung cấp dịch vụ AI và phần mềm cấp cao cho doanh nghiệp vừa và nhỏ: ứng dụng di động, website, ứng dụng AI, tự động hóa, chatbot, voice AI, hạ tầng cloud và hỗ trợ. Buổi tư vấn đầu tiên có thể miễn phí. Kênh liên hệ chính là LINE, WhatsApp, email và lịch gọi 30 phút.",
      "Tecxmate 為中小企業提供資深 AI 與軟體交付：行動 App、網站、AI 應用、自動化、聊天機器人、語音 AI、雲端基礎架構與支援。首次諮詢可免費。主要聯絡方式為 LINE、WhatsApp、email 與 30 分鐘預約連結。",
    ),
    quickQuestions: [
      { id: "services", label: M("What can Tecxmate build?", "Tecxmate có thể xây gì?", "Tecxmate 可以做什麼？") },
      { id: "cost", label: M("How much does a project cost?", "Một dự án tốn bao nhiêu?", "專案費用大概多少？") },
      { id: "timeline", label: M("How long does delivery take?", "Thời gian bàn giao bao lâu?", "交付需要多久？") },
      { id: "human", label: M("Talk to a human", "Nói chuyện với người thật", "找真人協助") },
    ],
    escalation: {
      primaryChannel: "line",
      contactEmail: company.contactEmail,
      lineLabel: "LINE",
      lineUrl: "https://lin.ee/PHAOtCo",
      message: M(
        "I may not be the best person to finish this. I can connect you with Tecxmate on LINE, or you can leave your email/phone if you want us to follow up.",
        "Có thể tôi không phải người phù hợp nhất để xử lý tiếp. Tôi có thể kết nối bạn với Tecxmate qua LINE, hoặc bạn có thể để lại email/số điện thoại nếu muốn chúng tôi liên hệ lại.",
        "這個問題可能需要真人協助。您可以透過 LINE 聯絡 Tecxmate，或主動留下 email/電話讓我們回覆。",
      ),
    },
    limits: {
      retainDays: 90,
      maxInputChars: 1200,
      maxMessagesPerHour: 30,
    },
  },
  about: {
    subtitle: M(
      "Empowering SMEs and Founders with premier technology consultancy and solutions",
      "Đồng hành cùng doanh nghiệp vừa và nhỏ và các nhà sáng lập bằng tư vấn và giải pháp công nghệ hàng đầu",
      "以頂尖的技術顧問與解決方案，賦能中小企業與創辦人",
    ),
    sections: [
      {
        id: "mission",
        heading: M("Our Mission", "Sứ mệnh của chúng tôi", "我們的使命"),
        paragraphs: [
          M(
            "At Tecxmate, we believe that technology should be accessible and transformative for businesses of all sizes. We are an LLC headquartered in Ho Chi Minh City, Vietnam, with operations in Taiwan, the US, and Vietnam. We specialize in delivering cutting-edge technology solutions that help SMEs and startups thrive in the digital age.",
            "Tại Tecxmate, chúng tôi tin rằng công nghệ phải dễ tiếp cận và tạo ra thay đổi thực sự cho doanh nghiệp ở mọi quy mô. Chúng tôi là công ty TNHH có trụ sở chính tại Thành phố Hồ Chí Minh, Việt Nam, với hoạt động tại Đài Loan, Hoa Kỳ và Việt Nam. Chúng tôi chuyên cung cấp các giải pháp công nghệ tiên tiến giúp doanh nghiệp vừa và nhỏ cùng startup phát triển mạnh trong kỷ nguyên số.",
            "在 Tecxmate，我們相信技術應該人人可用，並為各種規模的企業帶來實質改變。我們是一家總部位於越南胡志明市的有限責任公司，業務遍及台灣、美國與越南。我們專注於提供尖端技術解決方案，協助中小企業與新創在數位時代中成長茁壯。",
          ),
          M(
            "We incorporate AI into our core operations while leveraging human talents to achieve maximum delivery speed and product quality. Our mission is to give every business the tools they need to stay competitive and benefit from the world of modern technology.",
            "Chúng tôi đưa AI vào vận hành cốt lõi, kết hợp với năng lực con người để đạt tốc độ bàn giao và chất lượng sản phẩm cao nhất. Sứ mệnh của chúng tôi là trao cho mọi doanh nghiệp những công cụ cần thiết để duy trì lợi thế cạnh tranh và tận dụng được công nghệ hiện đại.",
            "我們將 AI 導入核心營運，並結合人才的專業判斷，以達到最快的交付速度與最佳的產品品質。我們的使命是讓每一家企業都能取得所需工具，保持競爭力並從現代技術中獲益。",
          ),
        ],
        bullets: [],
      },
      {
        id: "what-we-do",
        heading: M("What We Do", "Chúng tôi làm gì", "我們提供什麼"),
        paragraphs: [
          M(
            "We provide comprehensive technology consultancy and solutions, including:",
            "Chúng tôi cung cấp dịch vụ tư vấn và giải pháp công nghệ toàn diện, bao gồm:",
            "我們提供全方位的技術顧問與解決方案，包括：",
          ),
        ],
        bullets: [
          M(
            "AI Application Development - Building intelligent applications powered by machine learning, NLP, and computer vision",
            "Phát triển ứng dụng AI – Xây dựng các ứng dụng thông minh dựa trên machine learning, NLP và computer vision",
            "AI 應用開發 – 打造以機器學習、自然語言處理與電腦視覺驅動的智慧應用",
          ),
          M(
            "Business Automation - Automating workflows, streamlining operations, and integrating systems",
            "Tự động hóa doanh nghiệp – Tự động hóa quy trình, tinh gọn vận hành và tích hợp hệ thống",
            "企業流程自動化 – 自動化工作流程、精簡營運並整合系統",
          ),
          M(
            "AI Chatbot Development - Building chatbots for Line, Messenger, Telegram, and customer service automation",
            "Phát triển chatbot AI – Xây dựng chatbot cho Line, Messenger, Telegram và tự động hóa chăm sóc khách hàng",
            "AI 聊天機器人開發 – 建置 Line、Messenger、Telegram 聊天機器人與客服自動化",
          ),
          M(
            "Digital Transformation - Helping businesses transform their operations with modern technology",
            "Chuyển đổi số – Giúp doanh nghiệp chuyển đổi vận hành bằng công nghệ hiện đại",
            "數位轉型 – 協助企業以現代技術轉型營運",
          ),
        ],
      },
      {
        id: "approach",
        heading: M("Our Approach", "Cách chúng tôi làm việc", "我們的做法"),
        paragraphs: [
          M(
            "We combine the power of AI with human expertise to deliver fast, high-quality solutions. Our approach focuses on:",
            "Chúng tôi kết hợp sức mạnh của AI với chuyên môn con người để mang lại giải pháp nhanh và chất lượng cao. Cách làm của chúng tôi tập trung vào:",
            "我們結合 AI 的效率與人的專業判斷，快速交付高品質的解決方案。我們的做法著重於：",
          ),
        ],
        bullets: [
          M(
            "Fast delivery without compromising quality",
            "Bàn giao nhanh mà không đánh đổi chất lượng",
            "快速交付，且不犧牲品質",
          ),
          M(
            "Innovative solutions tailored to your business needs",
            "Giải pháp sáng tạo, thiết kế riêng theo nhu cầu doanh nghiệp của bạn",
            "依您的業務需求量身打造的創新解決方案",
          ),
          M(
            "Cost-effective solutions for SMEs and startups",
            "Giải pháp tối ưu chi phí cho doanh nghiệp vừa và nhỏ và startup",
            "為中小企業與新創打造的高性價比方案",
          ),
          M(
            "Ongoing support and partnership",
            "Hỗ trợ và đồng hành lâu dài",
            "持續的支援與長期合作",
          ),
        ],
      },
      {
        id: "why-choose",
        heading: M("Why Choose Tecxmate", "Vì sao chọn Tecxmate", "為什麼選擇 Tecxmate"),
        paragraphs: [
          M(
            "We serve clients worldwide with professional, high-quality technology solutions. Whether you're a startup looking to build your first AI application or an established SME seeking to automate operations, we're here to help you build the future.",
            "Chúng tôi phục vụ khách hàng trên toàn cầu bằng các giải pháp công nghệ chuyên nghiệp, chất lượng cao. Dù bạn là startup đang xây dựng ứng dụng AI đầu tiên hay một doanh nghiệp vừa và nhỏ đã ổn định muốn tự động hóa vận hành, chúng tôi luôn sẵn sàng đồng hành để cùng bạn kiến tạo tương lai.",
            "我們以專業、高品質的技術解決方案服務全球客戶。無論您是正要打造第一個 AI 應用的新創，或是希望自動化營運的成熟中小企業，我們都能協助您打造未來。",
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
    // Kept under ~60 characters so Google does not truncate it in results.
    title: "TECXMATE — Global Technology Partner | Custom AI, Apps & Web",
    description:
      "Tecxmate is your global technology partner for custom AI, mobile and web apps, product development and software engineering. Book a consultation today.",
    keywords: [
      "technology partner",
      "custom AI development",
      "AI integration",
      "app development",
      "mobile app development",
      "web development",
      "product development",
      "software engineering",
      "software development",
      "digital transformation",
      "business automation",
      "startup consulting",
      "SME solutions",
      "enterprise solutions",
    ],
    ogTitle: "TECXMATE — Your Global Technology Partner",
    ogDescription:
      "Custom AI, apps, web, product development and software engineering — built and delivered by a partner that owns the outcome. Book a consultation today.",
    twitterDescription:
      "Custom AI, apps, web, product development and software engineering. Your global technology partner.",
    twitterCreator: "@tecxmate",
  },
}

function mergeContent(stored?: Partial<SiteContent>): SiteContent {
  if (!stored) return defaultContent

  const storedHeroTitle = stored.hero?.title?.en?.trim()
  const storedHeroSubtitle = stored.hero?.subtitle?.en?.trim()
  const usesLegacyHero =
    storedHeroTitle === "Top-tier engineering, without the overhead" ||
    storedHeroSubtitle === "Senior AI and software delivery for SMEs. One senior team, one invoice, shipping in weeks."
  const hero = usesLegacyHero
    ? defaultContent.hero
    : {
        title: {
          ...defaultContent.hero.title,
          ...stored.hero?.title,
        },
        subtitle: {
          ...defaultContent.hero.subtitle,
          ...stored.hero?.subtitle,
        },
        cta: {
          label: {
            ...defaultContent.hero.cta.label,
            ...stored.hero?.cta?.label,
          },
          // Empty string is a valid "cleared" URL only if intentional; treat a
          // missing/blank stored URL as "use the default" so an older saved
          // content blob (written before the CTA was editable) still renders
          // the working calendar link instead of a dead button.
          url: stored.hero?.cta?.url?.trim() || defaultContent.hero.cta.url,
        },
      }

  return {
    ...defaultContent,
    ...stored,
    hero,
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
    chatbot: {
      ...defaultContent.chatbot,
      ...stored.chatbot,
      title: {
        ...defaultContent.chatbot.title,
        ...stored.chatbot?.title,
      },
      subtitle: {
        ...defaultContent.chatbot.subtitle,
        ...stored.chatbot?.subtitle,
      },
      greeting: {
        ...defaultContent.chatbot.greeting,
        ...stored.chatbot?.greeting,
      },
      placeholder: {
        ...defaultContent.chatbot.placeholder,
        ...stored.chatbot?.placeholder,
      },
      systemPrompt: {
        ...defaultContent.chatbot.systemPrompt,
        ...stored.chatbot?.systemPrompt,
      },
      knowledge: {
        ...defaultContent.chatbot.knowledge,
        ...stored.chatbot?.knowledge,
      },
      quickQuestions: stored.chatbot?.quickQuestions ?? defaultContent.chatbot.quickQuestions,
      escalation: {
        ...defaultContent.chatbot.escalation,
        ...stored.chatbot?.escalation,
        message: {
          ...defaultContent.chatbot.escalation.message,
          ...stored.chatbot?.escalation?.message,
        },
      },
      limits: {
        ...defaultContent.chatbot.limits,
        ...stored.chatbot?.limits,
      },
    },
  }
}

export function isSectionEnabled(content: SiteContent, section: SectionKey): boolean {
  return content.settings.sections[section] !== false
}

function isHomepageSectionKey(value: unknown): value is HomepageSectionKey {
  return HOMEPAGE_SECTION_KEYS.includes(value as HomepageSectionKey)
}

/**
 * The saved homepage order, sanitised: unknown/duplicate keys dropped, and any key missing
 * from the saved list appended in default order so a newly added section never disappears.
 */
export function homepageSectionOrder(content: SiteContent): HomepageSectionKey[] {
  const saved = content.settings.homepageOrder ?? []
  const ordered: HomepageSectionKey[] = []
  for (const key of saved) {
    if (isHomepageSectionKey(key) && !ordered.includes(key)) ordered.push(key)
  }
  for (const key of HOMEPAGE_SECTION_KEYS) {
    if (!ordered.includes(key)) ordered.push(key)
  }
  return ordered
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
