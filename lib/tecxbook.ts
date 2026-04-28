export type TecxbookEntry = {
  slug: string
  title: string
  description: string
  file: string
  cover?: string
  tags?: string[]
}

export const tecxbook: TecxbookEntry[] = [
  {
    slug: "high-finance",
    title: "The Architecture of High Finance",
    description:
      "A practitioner's map of capital markets, institutions, and the flows that connect them.",
    file: "/tecxbook/high_finance.html",
    tags: ["Finance", "Reference"],
  },
]

export function getTecxbookEntry(slug: string): TecxbookEntry | undefined {
  return tecxbook.find((e) => e.slug === slug)
}
