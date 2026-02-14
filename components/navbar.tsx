"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { Menu, X, Globe } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { useLanguage, type Language } from "@/components/language-provider"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const { language, setLanguage, t } = useLanguage()

  const languageLabels: Record<Language, string> = {
    en: "English",
    vi: "Tiếng Việt",
    zh: "中文",
  }

  const isActive = useCallback((path: string) => {
    return pathname === path
  }, [pathname])
  
  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev)
  }, [])
  
  const closeMenu = useCallback(() => {
    setIsMenuOpen(false)
  }, [])

  const handleLanguageSelect = useCallback(
    (lang: Language) => {
      setLanguage(lang)
      closeMenu()
    },
    [setLanguage, closeMenu],
  )

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 w-full border-b border-white/20 bg-white/95 md:bg-white/25 md:backdrop-blur-2xl shadow-sm md:shadow-[0_1px_0_0_rgba(255,255,255,0.35)_inset,0_10px_30px_rgba(0,0,0,0.06)]"
      >
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-accent italic tracking-wide text-primary">
            <span className="font-thin">tecx</span><span className="font-thin">mate</span>
          </span>
          <span className="text-2xl font-accent italic tracking-wide text-primary">達盟科技</span>
        </Link>
        <nav className="hidden md:flex gap-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors ${isActive("/") ? "text-primary" : "hover:text-primary"}`}
          >
            {t("home")}
          </Link>
          <Link 
            href="/services" 
            className={`text-sm font-medium transition-colors ${isActive("/services") ? "text-primary" : "hover:text-primary"}`}
          >
            {t("services")}
          </Link>
          <Link
            href="/blog"
            className={`text-sm font-medium transition-colors ${isActive("/blog") ? "text-primary" : "hover:text-primary"}`}
          >
            {t("news_insights")}
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="hidden md:flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>{languageLabels[language]}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.entries(languageLabels).map(([code, label]) => (
                <DropdownMenuItem
                  key={code}
                  onClick={() => handleLanguageSelect(code as Language)}
                  className={code === language ? "bg-muted/50" : undefined}
                >
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button className="hidden md:flex" asChild>
            <a href="https://cal.com/nikolasdoan/30min" target="_blank" rel="noopener noreferrer">
              {t("book_call")}
            </a>
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMenu}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="container md:hidden">
          <nav className="flex flex-col gap-4 p-4">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors ${isActive("/") ? "text-primary" : "hover:text-primary"}`}
              onClick={closeMenu}
            >
              {t("home")}
            </Link>
            <Link
              href="/services"
              className={`text-sm font-medium transition-colors ${isActive("/services") ? "text-primary" : "hover:text-primary"}`}
              onClick={closeMenu}
            >
              {t("services")}
            </Link>
            <Link
              href="/blog"
              className={`text-sm font-medium transition-colors ${isActive("/blog") ? "text-primary" : "hover:text-primary"}`}
              onClick={closeMenu}
            >
              {t("news_insights")}
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>{languageLabels[language]}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-full">
                {Object.entries(languageLabels).map(([code, label]) => (
                  <DropdownMenuItem
                    key={code}
                    onClick={() => handleLanguageSelect(code as Language)}
                    className={code === language ? "bg-muted/50" : undefined}
                  >
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button className="w-full" onClick={closeMenu} asChild>
              <a href="https://cal.com/nikolasdoan/30min" target="_blank" rel="noopener noreferrer">
                {t("book_call")}
              </a>
            </Button>
          </nav>
        </div>
      )}
      </header>
      {/* Spacer so page content is not hidden under fixed navbar */}
      <div className="h-16 shrink-0" aria-hidden />
    </>
  )
}
