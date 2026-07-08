"use client"

import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { Menu, X, Globe } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { useLanguage, type Language } from "@/components/language-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import type { SectionVisibility } from "@/lib/site-content"

const DEFAULT_SECTIONS: SectionVisibility = {
  hero: true,
  problem: true,
  economics: true,
  proof: true,
  technology: true,
  process: true,
  trust: true,
  cta: true,
  projects: false,
  services: false,
  team: true,
  blog: true,
  about: true,
  tecxbook: true,
}

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [sections, setSections] = useState<SectionVisibility>(DEFAULT_SECTIONS)
  const pathname = usePathname()
  const { language, setLanguage, t } = useLanguage()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    fetch("/api/content", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((content) => {
        setSections({
          ...DEFAULT_SECTIONS,
          ...content?.settings?.sections,
        })
      })
      .catch(() => undefined)
  }, [])

  const languageLabels: Record<Language, string> = {
    en: "English",
    vi: "Tiếng Việt",
    zh: "中文",
  }

  const isActive = useCallback((path: string) => {
    if (!mounted) return false
    // For homepage hash links, they are only "active" if we are on the homepage AND the hash matches
    // But since usePathname doesn't give us the hash, we'll just match the path part
    // To avoid all hash links being active on home, we only highlight the exact path match
    return pathname === path
  }, [pathname, mounted])
  
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
        className="fixed top-0 left-0 right-0 z-50 w-full border-b border-border/40 bg-background/95 md:bg-background/80 md:backdrop-blur-2xl shadow-sm"
      >
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-2xl font-accent italic tracking-wide text-primary">
            <span className="font-thin">tecx</span><span className="font-thin">mate</span>
          </span>
        </Link>
        <nav className="hidden md:flex gap-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors ${isActive("/") ? "text-primary" : "hover:text-primary"}`}
          >
            {t("home")}
          </Link>
          {sections.projects && (
            <Link
              href="/#portfolio"
              className={`text-sm font-medium transition-colors ${isActive("/#portfolio") ? "text-primary" : "hover:text-primary"}`}
            >
              {t("projects")}
            </Link>
          )}
          {sections.proof && (
            <Link
              href="/#proof"
              className={`text-sm font-medium transition-colors ${isActive("/#proof") ? "text-primary" : "hover:text-primary"}`}
            >
              {t("services")}
            </Link>
          )}
          {sections.team && (
            <Link
              href="/#team"
              className={`text-sm font-medium transition-colors ${isActive("/#team") ? "text-primary" : "hover:text-primary"}`}
            >
              {t("team")}
            </Link>
          )}
          {sections.about && (
            <Link
              href="/about"
              className={`text-sm font-medium transition-colors ${isActive("/about") ? "text-primary" : "hover:text-primary"}`}
            >
              {t("about")}
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex">
            <ThemeToggle />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="hidden md:flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>{mounted ? languageLabels[language] : languageLabels.en}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.entries(languageLabels).map(([code, label]) => (
                <DropdownMenuItem
                  key={code}
                  onClick={() => handleLanguageSelect(code as Language)}
                  className={mounted && code === language ? "bg-muted/50" : undefined}
                >
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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
            {sections.projects && (
              <Link
                href="/#portfolio"
                className={`text-sm font-medium transition-colors ${isActive("/#portfolio") ? "text-primary" : "hover:text-primary"}`}
                onClick={closeMenu}
              >
                {t("projects")}
              </Link>
            )}
            {sections.proof && (
              <Link
                href="/#proof"
                className={`text-sm font-medium transition-colors ${isActive("/#proof") ? "text-primary" : "hover:text-primary"}`}
                onClick={closeMenu}
              >
                {t("services")}
              </Link>
            )}
            {sections.team && (
              <Link
                href="/#team"
                className={`text-sm font-medium transition-colors ${isActive("/#team") ? "text-primary" : "hover:text-primary"}`}
                onClick={closeMenu}
              >
                {t("team")}
              </Link>
            )}
            {sections.about && (
              <Link
                href="/about"
                className={`text-sm font-medium transition-colors ${isActive("/about") ? "text-primary" : "hover:text-primary"}`}
                onClick={closeMenu}
              >
                {t("about")}
              </Link>
            )}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <span className="text-sm text-muted-foreground">Toggle theme</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>{mounted ? languageLabels[language] : languageLabels.en}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-full">
                {Object.entries(languageLabels).map(([code, label]) => (
                  <DropdownMenuItem
                    key={code}
                    onClick={() => handleLanguageSelect(code as Language)}
                    className={mounted && code === language ? "bg-muted/50" : undefined}
                  >
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      )}
      </header>
      {/* Spacer so page content is not hidden under fixed navbar */}
      <div className="h-16 shrink-0" aria-hidden />
    </>
  )
}
