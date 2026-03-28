export type NewsItem = {
  id: string
  title: string
  excerpt: string
  date: string // ISO 8601
  source: "Ars Technica" | "The Verge" | "Hacker News"
  url: string
  imageUrl: string | null
}
