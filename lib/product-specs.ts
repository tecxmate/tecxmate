import type { ProductName } from "@/components/brand/product-wordmark"
import { salesDeck } from "@/lib/sales-deck"

/**
 * The product pages at /products/<id>, in a spec-sheet layout: a tile, one line,
 * two buttons, then specification groups. English and Chinese only.
 *
 * Every value here is already public on tecxmate.com or the product's own site,
 * or was confirmed by that product's team. Add a row only with a source.
 */

export type Bi = { en: string; zh: string }

export type SpecGroup = { title: Bi; rows: [Bi, Bi][]; note?: Bi }

export type ProductSpec = {
  id: string
  name: ProductName
  /** The product's own app icon mark (an SVG in /public), shown in the tile instead of the wordmark. */
  icon?: string
  sub: Bi
  line: Bi
  /** Shown under the line: "<status> at <link>" or "<status> · <link>", or the status alone. */
  status: Bi
  statusLink?: { label: Bi; href: string; joiner: "at" | "dot" }
  ctas: { label: Bi; href: string; primary?: boolean }[]
  summary: Bi
  groups: SpecGroup[]
  metaDescription: string
}

const b = (en: string, zh: string): Bi => ({ en, zh })

const VOICETECX_DMG = "https://huggingface.co/nikolas-doan/VoiceTecx-releases/resolve/main/VoiceTecx.dmg"

export const PRODUCT_SPECS: ProductSpec[] = [
  {
    id: "tecxmap",
    name: "TecxMap",
    sub: b("臺灣地圖集 Taiwan Atlas", "臺灣地圖集 Taiwan Atlas"),
    line: b(
      "A map of about 1.7 million businesses registered in Taiwan, with district data from government open datasets.",
      "收錄臺灣約 170 萬筆營業登記的地圖，並結合政府開放資料的行政區資料。",
    ),
    status: b("Live", "已上線"),
    statusLink: { label: b("map.tecxmate.com", "map.tecxmate.com"), href: "https://map.tecxmate.com", joiner: "at" },
    ctas: [
      { label: b("Open the map", "開啟地圖"), href: "https://map.tecxmate.com", primary: true },
      { label: b("Book a pilot", "預約試用"), href: salesDeck.bookingUrl },
    ],
    summary: b(
      "Free public map. Sales teams get lead lists, territories and visit routes through 臺灣商情 TBIS.",
      "公開地圖免費使用。業務團隊可透過臺灣商情 TBIS 取得名單、業務轄區與拜訪路線。",
    ),
    groups: [
      {
        title: b("General specifications", "基本規格"),
        rows: [
          [b("Product type", "產品類型"), b("Web map and AI connector", "網頁地圖與 AI 連接器")],
          [b("Supported platforms", "支援平台"), b("Any web browser, desktop and phone; Claude (AI connector)", "任何網頁瀏覽器，電腦與手機皆可；Claude（AI 連接器）")],
          [b("Languages", "語言"), b("繁體中文, English", "繁體中文、英文")],
          [b("Coverage", "範圍"), b("All of Taiwan", "全臺灣")],
          [b("Businesses registered", "營業登記"), b("About 1.7 million", "約 170 萬筆")],
          [b("Placed on the map", "已上地圖"), b("About 1.57 million", "約 157 萬筆")],
          [
            b("Not placed", "未上地圖"),
            b(
              "嘉義市, 南投縣, 宜蘭縣, 連江縣 (no house-number data published)",
              "嘉義市、南投縣、宜蘭縣、連江縣（未公開門牌資料）",
            ),
          ],
          [b("Price", "價格"), b("Free public map; TBIS plans for companies", "公開地圖免費；企業方案為臺灣商情 TBIS")],
        ],
      },
      {
        title: b("Data sources", "資料來源"),
        rows: [
          [b("Business register", "營業登記"), b("財政部稅籍登記 (Ministry of Finance business-tax register)", "財政部稅籍登記")],
          [b("District data", "行政區資料"), b("Government open datasets", "政府開放資料")],
          [b("Health facilities", "醫療院所"), b("NHI-contracted hospitals, clinics and pharmacies", "健保特約醫院、診所與藥局")],
          [b("Licence", "授權"), b("Open-licence sources only (政府資料開放授權條款 v1 or equivalent)", "僅使用開放授權資料（政府資料開放授權條款第 1 版或同等授權）")],
        ],
        note: b("Every figure carries its source and date.", "每個數字都附上來源與日期。"),
      },
      {
        title: b("AI connector (MCP)", "AI 連接器（MCP）"),
        rows: [
          [b("Works with", "支援"), b("Claude", "Claude")],
          [b("Answers", "回答"), b("With source and date", "附來源與日期")],
          [
            b("Free tools", "免費工具"),
            b(
              "Business search, businesses near a point, district summaries and rankings, location quotient, industry sales, listed-company financials, health facilities, trade statistics",
              "營業登記搜尋、附近營業登記、行政區摘要與排名、區位商數、產業銷售額、上市櫃公司財報、醫療院所、貿易統計",
            ),
          ],
          [
            b("TBIS tools", "TBIS 工具"),
            b(
              "Visit plans, routes, 地段 place reports, weekly changes, grid headroom, house prices, regulatory penalties",
              "拜訪計畫、路線規劃、地段報告、每週變動、電網餘裕、房價比較、裁罰紀錄",
            ),
          ],
        ],
      },
      {
        title: b("Privacy", "隱私"),
        rows: [
          [b("Sole proprietors (獨資/合夥)", "獨資與合夥"), b("Never named outside aggregates", "只以彙總數字呈現，不列名")],
          [b("統一編號 and full addresses", "統一編號與完整地址"), b("Not available through the connector", "AI 連接器不提供")],
          [b("Removal requests", "移除申請"), b("Honoured everywhere", "所有服務一律遵守")],
        ],
      },
    ],
    metaDescription:
      "TecxMap (臺灣地圖集 Taiwan Atlas): a map of about 1.7 million businesses registered in Taiwan, with district data from government open datasets.",
  },
  {
    id: "datatecx",
    name: "DataTecx",
    sub: b("Sovereign AI for Taiwan data", "臺灣資料主權 AI"),
    line: b(
      "Built to run offline on an agency's own servers. Offline AI tested on one laptop.",
      "設計為在機關自己的伺服器上離線運作。離線 AI 已在一台筆電上測試。",
    ),
    status: b("Pilot wanted", "徵求試行"),
    statusLink: { label: b("Talk with us", "與我們聊聊"), href: salesDeck.bookingUrl, joiner: "dot" },
    ctas: [
      { label: b("Talk about a pilot", "洽談試行"), href: salesDeck.bookingUrl, primary: true },
      { label: b("Contact us", "聯絡我們"), href: "/quote?product=datatecx" },
    ],
    summary: b("Seeking a first government pilot.", "正在尋找第一個政府試行單位。"),
    groups: [
      {
        title: b("General specifications", "基本規格"),
        rows: [
          [b("Product type", "產品類型"), b("Offline AI for government data", "政府資料離線 AI")],
          [b("Supported platforms", "支援平台"), b("The agency's own servers, offline", "機關自有伺服器，離線運作")],
          [b("Tested on", "測試環境"), b("One laptop, fully offline", "一台筆電，完全離線")],
        ],
      },
      {
        title: b("Answers", "回答"),
        rows: [
          [b("Sources", "來源"), b("Sourced records of Taiwan's agencies", "臺灣各機關有來源的紀錄")],
          [b("Every answer", "每個回答"), b("With source and date", "附來源與日期")],
        ],
      },
    ],
    metaDescription: "DataTecx: sovereign AI for Taiwan data, built to run offline on an agency's own servers.",
  },
  {
    id: "alphatecx",
    name: "AlphaTecx",
    sub: b("Taiwan Stock AI Connector", "臺股 AI 連接器"),
    line: b(
      "Connects Claude to Taiwan stock-market open data (TWSE, TPEx, MOPS). Ask in plain language, get sourced answers.",
      "把 Claude 接上臺股開放資料（證交所、櫃買中心、公開資訊觀測站）。用口語提問，取得有來源的回答。",
    ),
    status: b("Live preview", "預覽中"),
    statusLink: { label: b("Talk with us", "與我們聊聊"), href: salesDeck.bookingUrl, joiner: "dot" },
    ctas: [
      { label: b("Contact us", "聯絡我們"), href: "/quote?product=alphatecx", primary: true },
      { label: b("Book a call", "預約通話"), href: salesDeck.bookingUrl },
    ],
    summary: b("Fund flows, supply chain and risk alerts, from open data.", "資金流向、供應鏈與風險提醒，全部來自開放資料。"),
    groups: [
      {
        title: b("General specifications", "基本規格"),
        rows: [
          [b("Product type", "產品類型"), b("AI connector (MCP)", "AI 連接器（MCP）")],
          [b("Supported platforms", "支援平台"), b("Claude", "Claude")],
          [b("Markets", "市場"), b("TWSE, TPEx", "上市、上櫃")],
          [b("Data sources", "資料來源"), b("TWSE, TPEx and MOPS open data", "證交所、櫃買中心與公開資訊觀測站開放資料")],
        ],
      },
      {
        title: b("Capabilities", "功能"),
        rows: [
          [b("Fund flows", "資金流向"), b("Institutional buying and selling", "三大法人買賣")],
          [b("Supply chain", "供應鏈"), b("Links between listed companies", "上市櫃公司之間的關聯")],
          [b("Risk alerts", "風險提醒"), b("Risk light and stop alerts; it never gives a buy signal", "風險燈號與停損提醒；從不給買進訊號")],
        ],
      },
      {
        title: b("Privacy", "隱私"),
        rows: [
          [b("Bank and brokerage accounts", "銀行與證券帳戶"), b("Never read", "從不讀取")],
          [b("Access", "權限"), b("Read-only", "唯讀")],
        ],
      },
    ],
    metaDescription:
      "AlphaTecx connects Claude to Taiwan stock-market open data (TWSE, TPEx, MOPS): fund flows, supply chain and risk alerts with sources.",
  },
  {
    id: "etecx",
    name: "eTecx",
    sub: b("Power-electronics simulator", "電力電子模擬器"),
    line: b(
      "A circuit simulator, desktop and web, for engineers who design power converters.",
      "給設計電源轉換器的工程師使用的電路模擬器，有桌面版與網頁版。",
    ),
    status: b("In development", "開發中"),
    statusLink: { label: b("Talk with us", "與我們聊聊"), href: salesDeck.bookingUrl, joiner: "dot" },
    ctas: [
      { label: b("Contact us", "聯絡我們"), href: "/quote?product=etecx", primary: true },
      { label: b("See the research", "看研究"), href: "/research" },
    ],
    summary: b("Built-in AI design help, on the desktop and in the browser.", "內建 AI 設計協助，桌面版與網頁版都有。"),
    groups: [
      {
        title: b("General specifications", "基本規格"),
        rows: [
          [b("Product type", "產品類型"), b("Circuit simulator for power electronics", "電力電子電路模擬器")],
          [b("Supported platforms", "支援平台"), b("Desktop app and web browser", "桌面應用程式與網頁瀏覽器")],
          [b("Languages", "語言"), b("English, 繁體中文", "英文、繁體中文")],
          [b("AI", "AI"), b("Built-in design assistant", "內建設計助理")],
        ],
      },
      {
        title: b("Accuracy", "準確度"),
        rows: [
          [b("Checks within tolerance", "落在容許誤差內"), b("322 of 338", "338 項中 322 項")],
          [b("Compared against", "比對對象"), b("Analytic results, ngspice, data-sheet values", "解析解、ngspice、規格書數值")],
          [b("Published", "發表"), b("November 2026", "2026 年 11 月")],
        ],
        note: b("From the eTecx accuracy report on the Research page.", "出自研究頁面上的 eTecx 準確度報告。"),
      },
    ],
    metaDescription: "eTecx: a power-electronics circuit simulator, desktop and web, for engineers who design power converters.",
  },
  {
    // Every row traces to tecxmate/voicetecx (WEBSITE-FACTCHECK.md, eval/results-apple-niko.md); owned by the VoiceTecx session.
    id: "voicetecx",
    name: "VoiceTecx",
    icon: "/products/voicetecx-mark.svg",
    sub: b("On-device dictation for the Mac", "Mac 裝置端語音輸入"),
    line: b(
      "Speak to type in any app and on the web. Traditional Chinese and English, even mixed in one sentence. Fully offline, private and secure.",
      "用說的打字，任何 App 和網頁都能用。支援繁體中文與英文，一句話中英夾雜也行。完全離線，私密又安全。",
    ),
    // The notarized beta (#60): VoiceTecx.dmg is always the latest release.
    status: b("Free public beta · Mac with Apple silicon", "免費公開測試中 · 搭載 Apple 晶片的 Mac"),
    ctas: [
      { label: b("Download the beta", "下載測試版"), href: VOICETECX_DMG, primary: true },
      { label: b("Join the early-bird list", "加入早鳥名單"), href: "/quote?product=voicetecx" },
    ],
    summary: b(
      "Dictation built for Taiwan: Traditional Chinese with the punctuation in place, English names spelled right, and nothing ever uploaded. No account, no subscription.",
      "為臺灣打造的語音輸入：繁體中文標點一次到位、英文名稱拼得正確，什麼都不上傳。不需帳號，不用訂閱。",
    ),
    groups: [
      {
        title: b("General specifications", "基本規格"),
        rows: [
          [b("Product type", "產品類型"), b("AI dictation and transcription, on your Mac", "AI 語音輸入與轉寫，在你的 Mac 上")],
          [b("Supported platforms", "支援平台"), b("Exclusively for Mac with Apple silicon (M1 or later), macOS 14 or later", "專為搭載 Apple 晶片（M1 或更新）的 Mac 打造，macOS 14 或更新版本")],
          [b("Memory", "記憶體"), b("16 GB minimum · 24 GB good · 32 GB best", "最低 16 GB・24 GB 佳・32 GB 最佳")],
          [b("Languages", "語言"), b("Taiwan Mandarin, English, or both in one sentence", "臺灣華語、英文，或一句話裡中英夾雜")],
          [b("Download", "下載大小"), b("About 2.5 GB for Chinese (English included); about 0.9 GB for English only", "中文約 2.5 GB（含英文）；只要英文約 0.9 GB")],
          [b("Price", "價格"), b("NT$1,490 incl. VAT, pay once (personal); NT$2,990 a seat (business)", "個人版 NT$1,490（含稅），一次買斷；企業版每席 NT$2,990")],
          [b("Free use", "免費使用"), b("Unlimited for 7 days, then 30 minutes of speech a month", "前 7 天不限時，之後每月 30 分鐘")],
        ],
      },
      {
        title: b("Features", "功能"),
        rows: [
          [b("Dictation", "語音輸入"), b("Speak into any app or web page; tap to start, or hold to talk", "任何 App 或網頁都能用說的輸入；點一下開始，或按住說話")],
          [b("File transcription", "錄音檔轉寫"), b("Turn recordings (mp3, wav, m4a…) into text or subtitles (.srt)", "把錄音（mp3、wav、m4a⋯）變成文字或字幕（.srt）")],
          [b("Learning", "學習"), b("Learns your names and words; fix a mistake once and it remembers", "記得你的名字與用詞；錯字改一次就會記住")],
        ],
      },
      {
        title: b("Test results", "測試結果"),
        rows: [
          [b("Character accuracy", "字元正確率"), b("About 93 of 100 (Apple macOS Dictation: about 87)", "約 93／100（Apple macOS 內建聽寫：約 87）")],
          [b("Punctuation", "標點分數"), b("85 of 100 (Apple macOS Dictation: 34)", "85／100（Apple macOS 內建聽寫：34）")],
          [b("Speed", "速度"), b("Standard: 1.31 s after you stop, plugged in; 1.92 s on battery in Low Power Mode (Apple macOS Dictation: 0.08 s)", "標準模式：說完後 1.31 秒（插電）；用電池、省電模式 1.92 秒（Apple macOS 內建聽寫：0.08 秒）")],
        ],
        note: b(
          "25 Taiwan Mandarin sentences read by one speaker, M5 MacBook Pro (16 GB unified memory), November 2026; Apple macOS Dictation on the same recordings.",
          "25 句臺灣華語由一位說話者朗讀，M5 MacBook Pro（16 GB 統一記憶體），2026 年 11 月；Apple macOS 內建聽寫使用同一批錄音。",
        ),
      },
      {
        title: b("Privacy", "隱私"),
        rows: [
          [b("Where it runs", "在哪裡執行"), b("Entirely on your Mac; works offline", "完全在你的 Mac 上，離線也能用")],
          [b("Your voice and text", "你的聲音與文字"), b("Never leave your Mac", "不會離開你的 Mac")],
          [b("Recordings", "錄音"), b("Not kept", "不保留")],
          [b("Account", "帳號"), b("None needed", "不需要")],
          [b("Internet", "網路"), b("Only to download languages and check for updates", "只用於下載語言檔與檢查更新")],
        ],
      },
    ],
    metaDescription:
      "VoiceTecx: on-device dictation for the Mac, built for Taiwan Mandarin, English and Traditional Chinese. Your voice and text never leave your Mac.",
  },
]

export function productSpec(id: string): ProductSpec | undefined {
  return PRODUCT_SPECS.find((p) => p.id === id)
}
