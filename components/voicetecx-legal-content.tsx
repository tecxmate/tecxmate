"use client"

import ReactMarkdown from "react-markdown"
import Link from "next/link"
import { useLanguage } from "@/components/language-provider"
import { VOICETECX_LEGAL, type LegalDoc } from "@/lib/voicetecx-legal"

const TABS: { doc: LegalDoc; en: string; zh: string }[] = [
  { doc: "privacy", en: "Privacy", zh: "隱私權" },
  { doc: "terms", en: "Licence agreement", zh: "授權條款" },
  { doc: "refund", en: "Refunds", zh: "退款" },
]

/** The VoiceTecx legal pages. Chinese for zh readers, English for everyone else (vi included). */
export function VoiceTecxLegalContent({ doc }: { doc: LegalDoc }) {
  const { language } = useLanguage()
  const lang = language === "zh" ? "zh" : "en"
  return (
    <div className="container px-4 md:px-6 max-w-4xl pt-28 pb-20 md:pt-32 md:pb-24">
      <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-4">
        <Link href="/products/voicetecx" className="hover:underline">VoiceTecx</Link>
      </p>
      <nav className="flex gap-2 overflow-x-auto pb-2 mb-8">
        {TABS.map((t) => (
          <Link
            key={t.doc}
            href={`/products/voicetecx/${t.doc}`}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
              t.doc === doc ? "bg-primary text-white border-primary" : "bg-card text-foreground border-border hover:border-primary"
            }`}
          >
            {t[lang]}
          </Link>
        ))}
      </nav>
      <article className="prose prose-lg dark:prose-invert max-w-none">
        <ReactMarkdown>{VOICETECX_LEGAL[doc][lang]}</ReactMarkdown>
      </article>
    </div>
  )
}
