import type { Locale, Localized } from "./site-content"

/**
 * Sales narrative content, derived from the canonical deck source
 * (tecxdeck/decks/tecxmate-sme/deck.yaml). Consumed by the homepage
 * sales sections and the /sales-deck interactive deck.
 *
 * Claim safety: figures flagged as illustrative/needs-source in the deck's
 * sources.csv are either labeled as illustrative in-copy (economics caption,
 * modernize-offering disclaimer) or softened. Verify before hardening any number.
 */

function M(en: string, vi: string, zh: string): Localized {
  return { en, vi, zh }
}

export function pickLocale(value: Localized, locale: Locale): string {
  return value[locale] || value.en
}

export type SalesMetric = { label: Localized; value: Localized }

export type SalesOffering = {
  id: string
  tag: Localized
  title: Localized
  summary: Localized
  problem: Localized
  solution: Localized
  outcome: Localized
  metrics: SalesMetric[]
  stack: string[]
  disclaimer?: Localized
}

export type CalculatorCurrency = {
  /** Intl.NumberFormat locale + currency for display. */
  locale: string
  currency: string
  min: number
  max: number
  step: number
  default: number
}

export const salesDeck = {
  bookingUrl: "https://cal.com/nikolasdoan/30min",

  cover: {
    title: M(
      "Top-tier engineering, minus the cost",
      "Kỹ thuật hàng đầu, chi phí tinh gọn",
      "頂尖工程實力，省下高昂成本",
    ),
    subtitle: M(
      "Senior AI and software delivery for SMEs — no hiring, no payroll, no HR overhead. One senior team, one invoice, shipping in weeks.",
      "Đội ngũ AI và phần mềm cấp cao cho doanh nghiệp — không tuyển dụng, không quỹ lương, không gánh nặng nhân sự. Một đội ngũ, một hóa đơn, bàn giao trong vài tuần.",
      "為中小企業提供資深 AI 與軟體交付——免招募、免薪資、免人事負擔。一個資深團隊、一張發票，數週內交付。",
    ),
    credibility: [
      M(
        "Taiwan-trained, Silicon Valley-experienced AI operators",
        "Đào tạo tại Đài Loan, kinh nghiệm chuẩn Silicon Valley",
        "台灣培育、具矽谷經驗的 AI 實戰者",
      ),
      M("NTU ME & SPE", "NTU ME & SPE", "台大機械與尖端科技"),
      M("NTUST EECS", "NTUST EECS", "台科大電資"),
    ],
    footer: "tecxmate · Taipei · Ho Chi Minh City · US",
  },

  problem: {
    title: M(
      "The real cost of a hire",
      "Chi phí thực sự của một lần tuyển dụng",
      "聘一位工程師的真實成本",
    ),
    points: [
      {
        title: M("Scarce and expensive.", "Khan hiếm và đắt đỏ.", "稀缺又昂貴。"),
        body: M(
          "Senior AI and cloud engineers are hard to find, slow to hire, and costly for an SME.",
          "Kỹ sư AI và cloud cấp cao rất khó tìm, tuyển chậm và tốn kém với doanh nghiệp vừa và nhỏ.",
          "資深 AI／雲端工程師難找、招募週期長，對中小企業而言成本極高。",
        ),
      },
      {
        title: M("A permanent cost.", "Một khoản chi cố định.", "一筆固定的長期成本。"),
        body: M(
          "Salary, bonuses, statutory insurance and pension, and overhead — paid every month, used or not.",
          "Lương, thưởng, bảo hiểm bắt buộc và chi phí quản lý — trả đều mỗi tháng, dù có dùng hết năng lực hay không.",
          "薪資、獎金、勞保／健保／勞退與管理成本——不論用不用得上，每月照付。",
        ),
      },
      {
        title: M(
          "Commitment cuts both ways.",
          "Cam kết ràng buộc cả hai phía.",
          "雇傭承諾是雙面刃。",
        ),
        body: M(
          "Pivot or wind down, and you carry severance, idle headcount, and labor-law rigidity.",
          "Khi xoay trục hay thu hẹp, bạn vẫn gánh trợ cấp thôi việc, nhân sự nhàn rỗi và các ràng buộc của luật lao động.",
          "一旦轉型或收縮，還要承擔資遣費、閒置人力與勞基法的種種限制。",
        ),
      },
    ],
    close: M(
      "Most SMEs don't need a bigger team. They need the work done — cleanly, and only when they need it.",
      "Phần lớn doanh nghiệp không cần thêm người. Họ cần công việc được hoàn thành — gọn gàng, và chỉ khi thực sự cần.",
      "多數中小企業需要的不是更大的團隊，而是把事情做好——乾淨俐落，需要時才啟動。",
    ),
    reframe: M(
      "Any shop can write the code. What moves your bottom line is what it costs, how fast it ships, and how much complexity you keep.",
      "Ai cũng có thể viết code. Điều ảnh hưởng đến lợi nhuận của bạn là chi phí bao nhiêu, giao nhanh thế nào, và bạn phải ôm bao nhiêu phức tạp.",
      "寫程式誰都會。真正影響獲利的，是成本多少、多快上線、你要背多少複雜度。",
    ),
    reframeStatement: M(
      "Silicon-Valley-grade work at a fraction of the cost of building in-house — and none of the employment burden.",
      "Chất lượng chuẩn Silicon Valley với chi phí thấp hơn nhiều so với tự xây đội ngũ — và không gánh nặng tuyển dụng.",
      "矽谷等級的交付品質，成本遠低於自建團隊——且完全沒有雇傭負擔。",
    ),
  },

  economics: {
    title: M(
      "Same caliber, a different cost",
      "Cùng đẳng cấp, chi phí khác biệt",
      "同樣的實力，不一樣的成本",
    ),
    caption: M(
      "Numbers are illustrative — we model the real comparison against your role and scope.",
      "Các con số mang tính minh họa — chúng tôi sẽ tính toán so sánh thực tế theo vị trí và phạm vi của bạn.",
      "數字僅供參考——我們會依您的職缺與需求範圍，建立真實的成本比較。",
    ),
    columns: {
      inHouse: M("Hiring in-house", "Tự xây đội ngũ", "在台自建團隊"),
      tecxmate: M("With Tecxmate", "Với Tecxmate", "與 Tecxmate 合作"),
    },
    rows: [
      {
        dimension: M("Price-to-quality", "Chi phí trên chất lượng", "價格與品質比"),
        inHouse: M(
          "Top salary for senior talent.",
          "Mức lương cao nhất cho nhân tài cấp cao.",
          "資深人才的頂級薪資。",
        ),
        tecxmate: M(
          "~50–70% lower total cost for equivalent caliber.",
          "Tổng chi phí thấp hơn ~50–70% với cùng đẳng cấp.",
          "同等實力，總成本約低 50–70%。",
        ),
      },
      {
        dimension: M("Time-to-ship", "Tốc độ bàn giao", "上線速度"),
        inHouse: M(
          "3–6 months to hire, then ramp.",
          "3–6 tháng tuyển dụng, rồi mới bắt nhịp.",
          "3–6 個月招募，還要磨合上手。",
        ),
        tecxmate: M(
          "Senior team starts now — MVP in weeks.",
          "Đội ngũ cấp cao bắt đầu ngay — MVP trong vài tuần.",
          "資深團隊立即開工——數週內交付 MVP。",
        ),
      },
      {
        dimension: M("Paperwork & employment", "Thủ tục & tuyển dụng", "行政與雇傭"),
        inHouse: M(
          "Payroll, statutory contributions, HR.",
          "Quỹ lương, bảo hiểm bắt buộc, nhân sự.",
          "薪資、勞健保提撥、人資作業。",
        ),
        tecxmate: M(
          "One B2B contract, one invoice.",
          "Một hợp đồng B2B, một hóa đơn.",
          "一份 B2B 合約、一張發票。",
        ),
      },
      {
        dimension: M("Versatility", "Tính linh hoạt", "彈性"),
        inHouse: M("Fixed headcount.", "Biên chế cố định.", "固定人力編制。"),
        tecxmate: M(
          "Scale up or down per project.",
          "Tăng giảm quy mô theo từng dự án.",
          "依專案隨時擴編或縮編。",
        ),
      },
    ],
    serviceNotHire: {
      title: M("A service, not a hire", "Một dịch vụ, không phải một lần tuyển dụng", "是服務，不是雇傭"),
      leftTitle: M(
        "Hiring in-house means carrying:",
        "Tự tuyển dụng nghĩa là phải gánh:",
        "自行聘僱，代表要承擔：",
      ),
      leftItems: [
        M("Months recruiting scarce senior talent", "Nhiều tháng săn tìm nhân tài khan hiếm", "花數月招募稀缺的資深人才"),
        M("Fixed salary + bonuses, regardless of workload", "Lương cứng + thưởng, bất kể khối lượng việc", "固定薪資與獎金，與工作量無關"),
        M("Statutory insurance, pension, and payroll admin", "Bảo hiểm bắt buộc, hưu trí và quản lý lương", "勞保／健保／勞退與薪資行政"),
        M("Labor law: overtime, leave, severance", "Luật lao động: tăng ca, nghỉ phép, trợ cấp thôi việc", "勞基法：加班、休假、資遣費"),
        M("HR & management overhead", "Chi phí nhân sự và quản lý", "人資與管理成本"),
        M("Hard to scale down or exit cleanly", "Khó thu hẹp hoặc kết thúc gọn gàng", "難以縮編或乾淨收尾"),
      ],
      rightTitle: M(
        "Working with Tecxmate means:",
        "Hợp tác cùng Tecxmate nghĩa là:",
        "與 Tecxmate 合作，代表：",
      ),
      rightItems: [
        M("A senior team ready now — no recruiting", "Đội ngũ cấp cao sẵn sàng ngay — không cần tuyển", "資深團隊即刻就位——無需招募"),
        M("One predictable invoice — no statutory burden", "Một hóa đơn cố định — không gánh nặng pháp định", "一張可預期的發票——沒有法定負擔"),
        M("No employment relationship, no severance risk", "Không quan hệ lao động, không rủi ro trợ cấp", "沒有雇傭關係，沒有資遣風險"),
        M("Scale per project; zero headcount on your books", "Quy mô theo dự án; không thêm biên chế", "依專案調整規模；帳上零編制"),
        M("Clean handover and exit when done", "Bàn giao gọn gàng khi hoàn tất", "完成後乾淨交接、俐落收尾"),
        M("You own the result outright", "Bạn sở hữu toàn bộ thành quả", "成果完全歸您所有"),
      ],
      close: M(
        "The output of a team without the obligations of an employer.",
        "Năng suất của cả một đội ngũ, không kèm nghĩa vụ của người sử dụng lao động.",
        "擁有一支團隊的產出，卻沒有雇主的義務。",
      ),
    },
  },

  proof: {
    title: M("What you get", "Bạn nhận được gì", "您將獲得什麼"),
    subtitle: M(
      "Start from wherever you are — an idea, a legacy operation, or a modern stack.",
      "Bắt đầu từ chính vị trí của bạn — một ý tưởng, một doanh nghiệp truyền thống, hay một hệ thống hiện đại.",
      "從您現在的位置開始——一個構想、一間傳統企業，或一套現代系統。",
    ),
    offerings: [
      {
        id: "apps",
        tag: M("Starting from zero", "Bắt đầu từ con số 0", "從零開始"),
        title: M(
          "Cross-platform apps — idea to App Store",
          "Ứng dụng đa nền tảng — từ ý tưởng lên App Store",
          "跨平台應用——從構想到上架",
        ),
        summary: M(
          "iOS and Android apps with a web admin panel — designed, built, published, and monetizing in weeks. Our flagship service.",
          "Ứng dụng iOS và Android kèm trang quản trị web — thiết kế, xây dựng, phát hành và tạo doanh thu trong vài tuần. Dịch vụ chủ lực của chúng tôi.",
          "iOS 與 Android 應用，附網頁管理後台——數週內完成設計、開發、上架並開始獲利。我們的旗艦服務。",
        ),
        problem: M(
          "You have the idea and the customers — but no team, no app, no infrastructure.",
          "Bạn có ý tưởng và khách hàng — nhưng chưa có đội ngũ, ứng dụng hay hạ tầng.",
          "您有構想、有客戶——但沒有團隊、沒有應用、沒有基礎架構。",
        ),
        solution: M(
          "We design, build, and publish a cross-platform app — iOS, Android, and a web admin panel — with payments, AI features, and cloud infrastructure included.",
          "Chúng tôi thiết kế, xây dựng và phát hành ứng dụng đa nền tảng — iOS, Android và trang quản trị web — tích hợp sẵn thanh toán, tính năng AI và hạ tầng đám mây.",
          "我們設計、開發並上架跨平台應用——iOS、Android 加網頁管理後台——內建金流、AI 功能與雲端架構。",
        ),
        outcome: M(
          "A live product in the app stores, monetizing in weeks — and you own all of it.",
          "Một sản phẩm thực thụ trên các kho ứng dụng, tạo doanh thu trong vài tuần — và bạn sở hữu toàn bộ.",
          "數週內在應用商店上線並開始獲利——所有成果完全歸您。",
        ),
        metrics: [
          { label: M("MVP", "MVP", "MVP"), value: M("6 weeks", "6 tuần", "6 週") },
          {
            label: M("Platforms", "Nền tảng", "平台"),
            value: M("iOS · Android · Web", "iOS · Android · Web", "iOS · Android · Web"),
          },
        ],
        stack: ["iOS", "Android", "Web admin", "Stripe", "AWS"],
      },
      {
        id: "modernize",
        tag: M("Legacy business", "Doanh nghiệp truyền thống", "傳統企業數位化"),
        title: M(
          "Modernize & automate your operations",
          "Hiện đại hóa & tự động hóa vận hành",
          "營運現代化與自動化",
        ),
        summary: M(
          "We study your legacy workflows, consult on what to modernize first, and automate it — with an app, a web app, or an internal IT system.",
          "Chúng tôi khảo sát quy trình hiện tại, tư vấn nên hiện đại hóa gì trước, rồi tự động hóa — bằng ứng dụng, web app hoặc hệ thống IT nội bộ.",
          "我們深入研究您的既有流程，建議優先現代化的環節，再以應用程式、網頁系統或內部 IT 系統將其自動化。",
        ),
        problem: M(
          "A running business on paper, Excel, and memory — almost no IT, or systems too old to help.",
          "Một doanh nghiệp đang vận hành trên giấy tờ, Excel và trí nhớ — gần như không có IT, hoặc hệ thống đã quá cũ.",
          "一間靠紙本、Excel 和記憶運作的公司——幾乎沒有 IT，或系統老舊到幫不上忙。",
        ),
        solution: M(
          "We map your actual workflows, consult on what to modernize first, then automate it — documents drafted by AI agents, approvals with one tap, answers over WhatsApp, LINE, and Telegram.",
          "Chúng tôi lập bản đồ quy trình thực tế, tư vấn thứ tự hiện đại hóa, rồi tự động hóa — tài liệu do AI agent soạn, phê duyệt một chạm, trả lời qua WhatsApp, LINE và Telegram.",
          "我們梳理您的實際流程、建議現代化順序，再進行自動化——AI 代理起草文件、一鍵核准，並透過 WhatsApp、LINE、Telegram 即時應答。",
        ),
        outcome: M(
          "Hours of weekly office work become minutes, with most routine documents auto-drafted — no new hire.",
          "Hàng giờ công việc giấy tờ mỗi tuần chỉ còn vài phút, phần lớn tài liệu thường nhật được soạn tự động — không cần tuyển thêm.",
          "每週數小時的文書工作縮短為幾分鐘，多數例行文件自動起草——無需新聘人力。",
        ),
        metrics: [
          {
            label: M("Office time", "Thời gian giấy tờ", "文書時間"),
            value: M("18 → 3 hrs/wk", "18 → 3 giờ/tuần", "每週 18 → 3 小時"),
          },
          {
            label: M("Auto-drafted", "Soạn tự động", "自動起草"),
            value: M("~90%", "~90%", "約 90%"),
          },
        ],
        stack: ["AI Agents", "WhatsApp", "LINE", "Telegram", "ERP"],
        disclaimer: M(
          "Figures are modeled from a representative deployment.",
          "Số liệu được mô hình hóa từ một triển khai tiêu biểu.",
          "數據為代表性導入案例之推估值。",
        ),
      },
      {
        id: "ai-integration",
        tag: M("AI for existing systems", "AI cho hệ thống sẵn có", "為現有系統導入 AI"),
        title: M(
          "Cutting-edge AI, consulting & training",
          "AI tiên tiến, tư vấn & đào tạo",
          "尖端 AI、顧問與培訓",
        ),
        summary: M(
          "AI agents, voice, and automation integrated into your existing systems — with strategic planning and AI-skill training for your team.",
          "AI agent, giọng nói và tự động hóa tích hợp vào hệ thống sẵn có — kèm hoạch định chiến lược và đào tạo kỹ năng AI cho đội ngũ của bạn.",
          "將 AI 代理、語音與自動化整合進您的現有系統——並提供策略規劃與員工 AI 技能培訓。",
        ),
        problem: M(
          "Your systems already work — but AI is moving fast, and you don't want to fall behind.",
          "Hệ thống của bạn vẫn đang chạy tốt — nhưng AI tiến quá nhanh, và bạn không muốn bị bỏ lại.",
          "您的系統運作良好——但 AI 進展飛快，您不想被甩在後頭。",
        ),
        solution: M(
          "We integrate cutting-edge AI — agents, real-time voice, automation — into your existing stack, and bring your people along: strategy, planning, and hands-on AI-skill training.",
          "Chúng tôi tích hợp AI tiên tiến — agent, giọng nói thời gian thực, tự động hóa — vào hệ thống hiện có, và đồng hành cùng đội ngũ của bạn: chiến lược, hoạch định và đào tạo kỹ năng AI thực chiến.",
          "我們將尖端 AI——代理、即時語音、自動化——整合進您的現有系統，並帶著您的團隊一起前進：策略、規劃與實戰 AI 技能培訓。",
        ),
        outcome: M(
          "Your systems stay yours — just smarter, faster, and run by a team that knows how to use AI.",
          "Hệ thống vẫn là của bạn — chỉ là thông minh hơn, nhanh hơn, và được vận hành bởi đội ngũ thành thạo AI.",
          "系統依然是您的——只是更聰明、更快，且由一支懂得運用 AI 的團隊來駕馭。",
        ),
        metrics: [
          {
            label: M("First consultation & training", "Buổi tư vấn & đào tạo đầu tiên", "首次諮詢與培訓"),
            value: M("Free", "Miễn phí", "免費"),
          },
        ],
        stack: ["OpenAI", "Anthropic", "ElevenLabs", "Deepgram", "Automation"],
      },
    ] as SalesOffering[],
  },

  technology: {
    title: M("The technology we bring", "Công nghệ chúng tôi mang đến", "我們帶來的技術"),
    subtitle: M(
      "Concrete capability, already in production — not a service brochure.",
      "Năng lực cụ thể, đã chạy thực tế — không phải lời giới thiệu suông.",
      "已在實際環境運行的具體能力——不是型錄上的服務名稱。",
    ),
    items: [
      {
        icon: "bot",
        title: M("AI agents for document workflows", "AI agent cho quy trình tài liệu", "文件流程 AI 代理"),
        body: M(
          "Agents that draft contracts, quotes, and invoices from your templates — humans approve, nothing ships unreviewed.",
          "Agent soạn hợp đồng, báo giá, hóa đơn từ mẫu của bạn — con người phê duyệt, không gì được gửi khi chưa xem.",
          "代理依您的範本起草合約、報價與發票——由人核准，未審閱不放行。",
        ),
      },
      {
        icon: "message-square",
        title: M(
          "Multilingual chat on LINE, WhatsApp & Telegram",
          "Chat đa ngôn ngữ trên LINE, WhatsApp & Telegram",
          "LINE、WhatsApp、Telegram 多語聊天",
        ),
        body: M(
          "AI assistants that answer customers and staff where they already chat — in Chinese, Vietnamese, and English.",
          "Trợ lý AI trả lời khách hàng và nhân viên ngay trên nền tảng họ đang dùng — bằng tiếng Trung, Việt và Anh.",
          "AI 助理在客戶與員工慣用的通訊軟體上直接應答——中、越、英三語。",
        ),
      },
      {
        icon: "mic",
        title: M("Real-time voice AI", "AI giọng nói thời gian thực", "即時語音 AI"),
        body: M(
          "Live speech in and out with ElevenLabs and Deepgram — voice interfaces that hold a conversation.",
          "Giọng nói hai chiều thời gian thực với ElevenLabs và Deepgram — giao diện giọng nói đối thoại tự nhiên.",
          "以 ElevenLabs 與 Deepgram 實現即時語音輸入輸出——能對話的語音介面。",
        ),
      },
      {
        icon: "credit-card",
        title: M("Payments & Stripe integration", "Thanh toán & tích hợp Stripe", "金流與 Stripe 整合"),
        body: M(
          "Subscriptions, checkout, and billing wired in from day one, ready to monetize.",
          "Đăng ký, thanh toán và hóa đơn được tích hợp từ ngày đầu, sẵn sàng tạo doanh thu.",
          "訂閱、結帳與帳務從第一天就接好，隨時開始獲利。",
        ),
      },
      {
        icon: "smartphone",
        title: M("App Store & Google Play publishing", "Phát hành App Store & Google Play", "App Store 與 Google Play 上架"),
        body: M(
          "Cross-platform apps taken all the way through Apple and Google review to launch.",
          "Ứng dụng đa nền tảng được đưa qua toàn bộ quy trình xét duyệt của Apple và Google đến khi ra mắt.",
          "跨平台應用一路完成 Apple 與 Google 審核直到正式上線。",
        ),
      },
      {
        icon: "server-cog",
        title: M("ERP & internal operations systems", "Hệ thống ERP & vận hành nội bộ", "ERP 與內部營運系統"),
        body: M(
          "Lightweight systems built around your actual workflows — not the other way around.",
          "Hệ thống tinh gọn xây quanh quy trình thực tế của bạn — không bắt bạn đổi theo phần mềm.",
          "圍繞您實際流程打造的輕量系統——而不是要您遷就軟體。",
        ),
      },
      {
        icon: "cloud",
        title: M("Cloud architecture & automation", "Kiến trúc cloud & tự động hóa", "雲端架構與自動化"),
        body: M(
          "AWS-based infrastructure that is monitored, documented, and handed over — you own it.",
          "Hạ tầng trên AWS được giám sát, tài liệu hóa và bàn giao — bạn sở hữu toàn bộ.",
          "以 AWS 為基礎的架構，具備監控、文件與完整交接——所有權歸您。",
        ),
      },
    ],
  },

  process: {
    title: M("Clear delivery, no black boxes", "Bàn giao minh bạch, không hộp đen", "透明交付，沒有黑箱"),
    steps: [
      {
        title: M("Discover", "Khảo sát", "釐清"),
        body: M(
          "Map the bottleneck and define the outcome before code.",
          "Xác định điểm nghẽn và kết quả mong muốn trước khi viết code.",
          "先找出瓶頸、定義成果，再動手寫程式。",
        ),
      },
      {
        title: M("Architect", "Thiết kế", "規劃"),
        body: M(
          "Scoped plan, milestones, a fixed picture of done.",
          "Kế hoạch rõ phạm vi, cột mốc, và định nghĩa hoàn thành cụ thể.",
          "明確範圍、里程碑，以及「完成」的固定標準。",
        ),
      },
      {
        title: M("Build & sync", "Xây dựng & đồng bộ", "開發與同步"),
        body: M(
          "Same-day reviews; you always know what's being built.",
          "Review trong ngày; bạn luôn biết điều gì đang được xây dựng.",
          "當日回報審閱；您隨時掌握開發進度。",
        ),
      },
      {
        title: M("Ship & support", "Bàn giao & hỗ trợ", "交付與支援"),
        body: M(
          "Documented, monitored, handed over. You own it.",
          "Có tài liệu, có giám sát, bàn giao trọn vẹn. Bạn sở hữu tất cả.",
          "完整文件、持續監控、正式交接。成果歸您所有。",
        ),
      },
    ],
    engagementTitle: M("Ways to work with us", "Các hình thức hợp tác", "合作模式"),
    engagements: [
      {
        title: M("Development", "Phát triển", "開發"),
        body: M("Per feature scope + hours.", "Theo phạm vi tính năng + giờ công.", "依功能範圍與工時計價。"),
      },
      {
        title: M("Consulting", "Tư vấn", "顧問"),
        body: M("Hourly.", "Theo giờ.", "以小時計。"),
      },
      {
        title: M("Partnership", "Đối tác dài hạn", "長期夥伴"),
        body: M(
          "By scale, longevity, and monthly maintenance.",
          "Theo quy mô, thời gian hợp tác và bảo trì hàng tháng.",
          "依規模、合作期間與每月維運。",
        ),
      },
    ],
  },

  trust: {
    title: M("Global caliber, local trust", "Đẳng cấp toàn cầu, tin cậy bản địa", "全球實力，在地信任"),
    items: [
      {
        title: M("Founders you can trust here.", "Nhà sáng lập đáng tin cậy.", "值得信任的創辦人。"),
        body: M(
          "Nikolas Doan and Brian Nguyen — Taiwan-trained, globally proven AI and product engineering.",
          "Nikolas Doan và Brian Nguyen — đào tạo tại Đài Loan, năng lực AI và sản phẩm được chứng minh toàn cầu.",
          "Nikolas Doan 與 Brian Nguyen——台灣培育、國際實證的 AI 與產品工程實力。",
        ),
      },
      {
        title: M("We speak your language.", "Chúng tôi nói ngôn ngữ của bạn.", "我們說您的語言。"),
        body: M(
          "Chinese with you, Vietnamese to run delivery, English for global tech.",
          "Tiếng Trung với đối tác, tiếng Việt để vận hành, tiếng Anh cho công nghệ toàn cầu.",
          "用中文與您溝通、以越南語執行交付、用英文對接全球技術。",
        ),
      },
      {
        title: M("The same workday.", "Cùng múi giờ làm việc.", "同一個工作日。"),
        body: M(
          "Taipei and Ho Chi Minh City are one hour apart.",
          "Đài Bắc và TP. Hồ Chí Minh chỉ cách nhau một giờ.",
          "台北與胡志明市只差一小時。",
        ),
      },
      {
        title: M("A real legal entity.", "Pháp nhân thực sự.", "正式合法公司。"),
        body: M(
          "Clean cross-border B2B contracts and invoicing.",
          "Hợp đồng B2B xuyên biên giới và hóa đơn minh bạch.",
          "乾淨俐落的跨境 B2B 合約與發票。",
        ),
      },
      {
        title: M("Privacy by design.", "Bảo mật ngay từ thiết kế.", "隱私始於設計。"),
        body: M(
          "Architecture designed with Taiwan PDPA in mind.",
          "Kiến trúc được thiết kế với tinh thần luật bảo vệ dữ liệu cá nhân (PDPA) của Đài Loan.",
          "系統架構以台灣個資法（PDPA）為前提設計。",
        ),
      },
      {
        title: M("Fair pricing.", "Định giá công bằng.", "公道透明的定價。"),
        body: M(
          "Transparent scope and rates. No surprise markups.",
          "Phạm vi và đơn giá minh bạch. Không phụ phí bất ngờ.",
          "範圍與費率透明，絕無隱藏加價。",
        ),
      },
    ],
  },

  visuals: {
    calculator: {
      title: M(
        "Same caliber, a different cost",
        "Cùng đẳng cấp, chi phí khác biệt",
        "同樣的實力，不一樣的成本",
      ),
      caption: M(
        "Illustrative model — we build the real comparison against your role and scope.",
        "Mô hình minh họa — chúng tôi sẽ tính toán so sánh thực tế theo vị trí và phạm vi của bạn.",
        "示意模型——我們會依您的職缺與需求範圍，建立真實的成本比較。",
      ),
      sliderLabel: M(
        "Monthly salary of the engineer you'd hire",
        "Lương tháng của kỹ sư bạn định tuyển",
        "您打算聘的工程師月薪",
      ),
      // Annual cost = monthly salary × multiplier. Illustrative composition of a hire's true yearly cost.
      segments: [
        { id: "salary", multiplier: 12, label: M("Base salary", "Lương cơ bản", "本薪") },
        {
          id: "statutory",
          multiplier: 2,
          label: M("Statutory insurance & pension", "Bảo hiểm bắt buộc & hưu trí", "勞保／健保／勞退"),
        },
        {
          id: "overhead",
          multiplier: 2,
          label: M("Management & tools", "Quản lý & công cụ", "管理與工具"),
        },
        {
          id: "recruiting",
          multiplier: 1.5,
          label: M("Recruiting & ramp-up", "Tuyển dụng & bắt nhịp", "招募與磨合"),
        },
      ],
      /** Tecxmate total as a share of the in-house total (illustrative, within the deck's 50–70% claim). */
      tecxmateRatio: 0.4,
      inHouseLabel: M("Hiring in-house", "Tự xây đội ngũ", "自建團隊"),
      tecxmateLabel: M("With Tecxmate", "Với Tecxmate", "與 Tecxmate 合作"),
      perYear: M("per year", "mỗi năm", "每年"),
      savingsLabel: M("saved per year", "tiết kiệm mỗi năm", "每年省下"),
      currencies: {
        en: { locale: "en-US", currency: "USD", min: 2000, max: 12000, step: 250, default: 5000 },
        vi: { locale: "vi-VN", currency: "USD", min: 2000, max: 12000, step: 250, default: 5000 },
        zh: { locale: "zh-TW", currency: "TWD", min: 60000, max: 300000, step: 5000, default: 150000 },
      } as Record<Locale, CalculatorCurrency>,
    },

    org: {
      title: M("A service, not a hire", "Một dịch vụ, không phải một lần tuyển dụng", "是服務，不是雇傭"),
      toggleBefore: M("Hiring in-house", "Tự tuyển dụng", "自行聘僱"),
      toggleAfter: M("With Tecxmate", "Với Tecxmate", "與 Tecxmate 合作"),
      youLabel: M("You", "Bạn", "您"),
      productLabel: M("Product & revenue", "Sản phẩm & doanh thu", "產品與營收"),
      burdens: [
        M("Recruiting", "Tuyển dụng", "招募"),
        M("Payroll", "Quỹ lương", "薪資"),
        M("Statutory insurance", "Bảo hiểm bắt buộc", "勞保健保勞退"),
        M("HR admin", "Hành chính nhân sự", "人資行政"),
        M("Management", "Quản lý", "管理"),
        M("Labor law", "Luật lao động", "勞基法"),
        M("Severance risk", "Rủi ro trợ cấp", "資遣風險"),
      ],
      close: M(
        "The output of a team without the obligations of an employer.",
        "Năng suất của cả một đội ngũ, không kèm nghĩa vụ của người sử dụng lao động.",
        "擁有一支團隊的產出，卻沒有雇主的義務。",
      ),
    },

    voice: {
      title: M("Real-time voice AI", "AI giọng nói thời gian thực", "即時語音 AI"),
      subtitle: M(
        "Voice interfaces that hold a conversation — the same pipeline running in our own products today.",
        "Giao diện giọng nói đối thoại tự nhiên — chính pipeline đang chạy trong các sản phẩm của chúng tôi.",
        "能對話的語音介面——正是我們自家產品運行中的同一套管線。",
      ),
      stages: [
        { id: "in", brand: "", label: M("You speak", "Bạn nói", "您說話") },
        { id: "stt", brand: "Deepgram", label: M("Speech to text", "Giọng nói thành văn bản", "語音轉文字") },
        { id: "llm", brand: "OpenAI · Anthropic", label: M("Reasoning", "Suy luận", "推理") },
        { id: "tts", brand: "ElevenLabs", label: M("Text to speech", "Văn bản thành giọng nói", "文字轉語音") },
        { id: "out", brand: "", label: M("It answers", "AI trả lời", "即時回應") },
      ],
    },

    freeOffer: {
      badge: M("Free", "Miễn phí", "免費"),
      text: M(
        "Your first AI consultation and training session is free — for any SME, no strings.",
        "Buổi tư vấn và đào tạo AI đầu tiên hoàn toàn miễn phí — cho mọi doanh nghiệp, không ràng buộc.",
        "首次 AI 諮詢與教學課程完全免費——任何中小企業，沒有附帶條件。",
      ),
    },
  },

  cta: {
    title: M("Your bottleneck, solved.", "Điểm nghẽn của bạn, đã có lời giải.", "您的瓶頸，就此解決。"),
    body: M(
      "A 30-minute call — a clear read on what's possible and what it costs versus hiring.",
      "Một cuộc gọi 30 phút — cái nhìn rõ ràng về những gì khả thi và chi phí so với tự tuyển dụng.",
      "30 分鐘通話——清楚了解可行方案，以及相較自行聘僱的成本。",
    ),
    button: M("Book a 30-minute call", "Đặt cuộc gọi 30 phút", "預約 30 分鐘通話"),
  },
} as const
