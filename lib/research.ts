/**
 * The research gallery on /research: every public study from each TECXMATE
 * project. Each study keeps its home on its own project's site; this list only
 * points to it, so the two never drift apart. Add a study here only once it is
 * public on its project's site, with the title and finding that site uses.
 */

export type ResearchProject = "TECXMAP" | "DATATECX" | "AlphaTecx" | "eTecx"

type Bi = { en: string; zh: string }

export type Study = {
  id: string
  project: ResearchProject
  title: Bi
  finding: Bi
  topic: Bi
  /** Year and month published, YYYY-MM. */
  month: string
  url: string
  image?: string
  /** false keeps a study out of the public page. */
  public: boolean
}

export const STUDIES: Study[] = [
  {
    id: "cafe-zhongxiao",
    project: "TECXMAP",
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
    project: "TECXMAP",
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
]

export const PROJECTS: ResearchProject[] = ["TECXMAP", "DATATECX", "AlphaTecx", "eTecx"]
