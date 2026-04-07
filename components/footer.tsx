"use client"

import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin, Video, Phone } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { company } from "@/lib/company"

export function Footer() {
  const { language, t } = useLanguage()

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
                href="https://cal.com/nikolasdoan/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer"
              >
                <Video className="h-5 w-5 shrink-0" />
                <span className="text-sm">{t("book_discovery_call")}</span>
              </a>
              <div className="flex gap-3">
                <a
                  href="https://www.facebook.com/tecxmate"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <Facebook className="h-5 w-5" />
                  <span className="sr-only">Facebook</span>
                </a>
                <a
                  href="https://x.com/tecxmate"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <Twitter className="h-5 w-5" />
                  <span className="sr-only">X</span>
                </a>
                <a
                  href="https://www.instagram.com/tecxmate"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <Instagram className="h-5 w-5" />
                  <span className="sr-only">Instagram</span>
                </a>
                <a
                  href="https://tw.linkedin.com/company/tecxmate"
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
                  href={`mailto:${company.contactEmail}`}
                  className="text-white hover:text-primary transition-colors duration-200"
                >
                  {company.contactEmail}
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
              <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8">
                {/* Vietnam */}
                <div className="space-y-2 rounded-none border border-gray-700/50 p-4 sm:p-5 lg:p-6">
                  <p className="font-medium text-white text-sm sm:text-base">{language === "vi" ? company.legalName.vi : company.legalName.en}</p>
                  <p className="text-white text-xs sm:text-sm leading-relaxed">{t("address")}</p>
                  <p className="text-white text-xs sm:text-sm">MST: {company.taxNumber}</p>
                  <a
                    href={`tel:${company.phone.vn.tel}`}
                    className="inline-flex items-center gap-1.5 text-white hover:text-primary transition-colors duration-200 text-xs sm:text-sm mt-1"
                  >
                    <Phone className="h-4 w-4 shrink-0" />
                    {company.phone.vn.display}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 text-center text-sm text-white">
          <p className="text-white">
            © {new Date().getFullYear()} {company.name.toUpperCase()}. {t("all_rights_reserved")}
          </p>
        </div>
      </div>
    </footer>
  )
}
