"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin, Video, Phone } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { company } from "@/lib/company"
import type { CompanyInfo } from "@/lib/site-content"

export function Footer() {
  const { language, t } = useLanguage()
  const [live, setLive] = useState<CompanyInfo | null>(null)

  useEffect(() => {
    fetch("/api/content", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((c) => {
        if (c?.company) setLive(c.company)
      })
      .catch(() => {})
  }, [])

  // Live content overrides the static defaults once it arrives.
  const co = live ?? company
  const displayAddress = co.addressDisplay?.[language] || co.addressDisplay?.en || t("address")

  return (
    <footer id="footer" className="bg-alt-black py-12 md:py-16 border-0">
      <div className="container px-4 md:px-6 max-w-6xl">
        <div className="grid gap-8 md:grid-cols-12 md:gap-6">
          {/* Brand & Social */}
          <div className="space-y-4 md:col-span-4">
            <Link href="/" className="flex items-baseline gap-2">
              <span className="text-2xl font-accent italic tracking-wide text-white">
                <span className="font-thin">tecx</span>
                <span className="font-thin">mate</span>
              </span>
            </Link>
            <p className="text-sm text-gray-300 leading-relaxed">{t("got_idea")}</p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={co.social.booking}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer"
              >
                <Video className="h-5 w-5 shrink-0" />
                <span className="text-sm">{t("book_discovery_call")}</span>
              </a>
              <div className="flex gap-3">
                <a
                  href={co.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <Facebook className="h-5 w-5" />
                  <span className="sr-only">Facebook</span>
                </a>
                <a
                  href={co.social.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <Twitter className="h-5 w-5" />
                  <span className="sr-only">X</span>
                </a>
                <a
                  href={co.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <Instagram className="h-5 w-5" />
                  <span className="sr-only">Instagram</span>
                </a>
                <a
                  href={co.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <Linkedin className="h-5 w-5" />
                  <span className="sr-only">LinkedIn</span>
                </a>
              </div>
              <p className="text-sm text-gray-300">
                {t("email")}:{" "}
                <a
                  href={`mailto:${co.contactEmail}`}
                  className="text-white hover:text-primary transition-colors duration-200"
                >
                  {co.contactEmail}
                </a>
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 md:col-span-2">
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/about" className="hover:text-white transition-colors duration-200">
                  {t("about")}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors duration-200">
                  {t("news_insights")}
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-white transition-colors duration-200">
                  {t("privacy_policy")}
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="hover:text-white transition-colors duration-200">
                  {t("terms_of_service")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Contact - organized by country */}
          <div className="space-y-4 md:col-span-6">
            <div className="space-y-4 text-sm text-gray-300">
              <div className="space-y-2">
                <p className="font-medium text-white text-sm sm:text-base">{language === "vi" ? co.legalName.vi : co.legalName.en}</p>
                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">{displayAddress}</p>
                <p className="text-gray-300 text-xs sm:text-sm">MST: {co.taxNumber}</p>
                <a
                  href={`tel:${co.phone.vn.tel}`}
                  className="inline-flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors duration-200 text-xs sm:text-sm"
                >
                  <Phone className="h-4 w-4 shrink-0" />
                  {co.phone.vn.display}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 text-sm text-white flex items-center justify-between">
          <Link
            href="/admin/vcards"
            className="border border-gray-500 text-gray-300 hover:border-white hover:text-white transition-colors duration-200 text-sm px-3 py-1 rounded-md"
          >
            Admin
          </Link>
          <p className="text-white">
            © {new Date().getFullYear()} {co.name.toUpperCase()}. {t("all_rights_reserved")}
          </p>
        </div>
      </div>
    </footer>
  )
}
