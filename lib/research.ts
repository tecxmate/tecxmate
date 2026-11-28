/**
 * The research gallery on /research: every public study from each TECXMATE
 * project. Each study keeps its home on its own project's site; this list only
 * points to it, so the two never drift apart. Add a study here only once it is
 * public on its project's site, with the title and finding that site uses.
 */

export type ResearchProject = "TecxMap" | "DataTecx" | "AlphaTecx" | "eTecx" | "VoiceTecx"

type Bi = { en: string; zh: string }

export type Study = {
  id: string
  project: ResearchProject
  title: Bi
  finding: Bi
  topic: Bi
  /** Year and month published, YYYY-MM. */
  month: string
  /** One link, or one per language. */
  url: string | Bi
  image?: string | Bi
  /** false keeps a study out of the public page. */
  public: boolean
}

export const STUDIES: Study[] = [
  {
    id: "cafe-zhongxiao",
    project: "TecxMap",
    title: { zh: "忠孝東路二段咖啡店位置研究", en: "Café Positions on Zhongxiao East Road, Section 2" },
    finding: {
      zh: "辦公客人多，但咖啡店也特別密集",
      en: "Many office customers nearby, but a crowded corner for cafés",
    },
    topic: { zh: "商業", en: "Business" },
    month: "2026-11",
    url: "https://map.tecxmate.com/research/cafe-zhongxiao",
    image: "https://map.tecxmate.com/research/og-cafe.jpg",
    public: true,
  },
  {
    id: "pharmacy-access",
    project: "TecxMap",
    title: { zh: "臺灣藥局可近性偏低鄉鎮研究", en: "Townships with Low Pharmacy Access in Taiwan" },
    finding: {
      zh: "47 個鄉鎮沒有健保藥局，約 28 萬人住在那裡",
      en: "47 townships have no NHI pharmacy; about 284,000 people live there",
    },
    topic: { zh: "健康", en: "Health" },
    month: "2026-11",
    url: "https://health.tecxmate.com/",
    image: "https://map.tecxmate.com/research/og-health.jpg",
    public: true,
  },
  {
    id: "etecx-accuracy",
    project: "eTecx",
    title: { zh: "電力電子模擬器準確度報告", en: "Power Electronics Simulator Accuracy Report" },
    finding: {
      zh: "338 項比對中有 322 項落在容許誤差內，對照解析解、ngspice 與規格書數值",
      en: "322 of 338 checks fall within tolerance against analytic, ngspice and data-sheet references",
    },
    topic: { zh: "電力電子", en: "Power electronics" },
    month: "2026-11",
    // The product's own site is not public yet: the study links to its product page here, and the image is a local copy.
    url: "/products/etecx",
    image: { en: "/research/etecx-accuracy-en.png", zh: "/research/etecx-accuracy-zh.png" },
    public: true,
  },
  // VoiceTecx: the study's home is the product page's results (tecxmate/voicetecx docs/BENCHMARK-REPORT.md, claims
  // marked "Ads OK" or "On the website" only); the images are screenshots of those charts.
  {
    id: "voicetecx-benchmark",
    project: "VoiceTecx",
    title: { zh: "同一批錄音，五套離線語音辨識", en: "Five Offline Speech Tools, Same Recordings" },
    finding: {
      zh: "我們的測試，一位說話者：臺灣華語錯字比 Mac 內建聽寫少約 44%，標點也更好（89 比 34）。Apple 比較快",
      en: "Our test, one speaker: about 44% fewer mistakes in Taiwan Mandarin than Mac dictation, and better punctuation (89 vs 34). Apple is faster",
    },
    topic: { zh: "語音辨識", en: "Speech recognition" },
    month: "2026-11",
    url: "/products/voicetecx#results",
    image: { en: "/research/voicetecx-benchmark-en.png", zh: "/research/voicetecx-benchmark-zh.png" },
    public: true,
  },
  {
    id: "voicetecx-taiwan-names",
    project: "VoiceTecx",
    title: { zh: "自動改對臺灣地名和機關名", en: "Fixing Taiwan Place and Office Names" },
    finding: {
      zh: "368 個鄉鎮市區、35,798 條路名、367 個車站、117 個政府機關。在 172,221 段正確文字上，0 次改錯",
      en: "368 districts, 35,798 roads, 367 stations, 117 government offices. 0 wrong changes on 172,221 passages of correct text",
    },
    topic: { zh: "語音辨識", en: "Speech recognition" },
    month: "2026-11",
    url: "/products/voicetecx#taiwan",
    image: { en: "/research/voicetecx-taiwan-en.png", zh: "/research/voicetecx-taiwan-zh.png" },
    public: true,
  },
]

export const PROJECTS: ResearchProject[] = ["TecxMap", "DataTecx", "AlphaTecx", "eTecx", "VoiceTecx"]
