import type { Metadata } from "next"
import { DeckViewer } from "@/components/sales/deck-viewer"

export const metadata: Metadata = {
  title: "Sales Deck | TECXMATE — Top-tier Engineering, Minus the Cost",
  description:
    "The Tecxmate pitch in ten slides: senior AI and software delivery for SMEs at a fraction of in-house cost — no hiring, no payroll, one invoice.",
}

export default function SalesDeckPage() {
  return (
    <main>
      <DeckViewer />
    </main>
  )
}
