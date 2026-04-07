"use client"

import { ExternalLink, ChevronLeft, ChevronRight, X } from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState, useCallback } from "react"
import type { WPProject } from "@/app/api/projects/route"
import { useLanguage } from "@/components/language-provider"

export function DemoProductsSection() {
  const { t } = useLanguage()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const isScrollingRef = useRef(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [projects, setProjects] = useState<WPProject[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<WPProject | null>(null)

  // Fetch WordPress projects
  useEffect(() => {
    let mounted = true
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects")
        if (!res.ok) return
        const data: WPProject[] = await res.json()
        if (mounted) {
          setProjects(data)
        }
      } catch {
        // No projects to show
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchProjects()

    return () => { mounted = false }
  }, [])

  // Close modal on Escape key
  useEffect(() => {
    if (!selectedProject) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedProject(null)
    }
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [selectedProject])

  const checkScroll = () => {
    const container = scrollContainerRef.current
    if (!container) return
    const { scrollLeft, scrollWidth, clientWidth } = container
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  const handleScrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -320, behavior: "smooth" })
  }

  const handleScrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 320, behavior: "smooth" })
  }

  // Prevent card clicks during horizontal scrolling
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    let lastScrollLeft = container.scrollLeft
    let lastScrollTime = 0

    const handleScroll = () => {
      checkScroll()
      const currentScrollLeft = container.scrollLeft
      const now = Date.now()
      if (Math.abs(currentScrollLeft - lastScrollLeft) > 2) {
        isScrollingRef.current = true
        lastScrollTime = now
        clearTimeout(scrollTimeoutRef.current)
        scrollTimeoutRef.current = setTimeout(() => {
          if (Date.now() - lastScrollTime >= 250) {
            isScrollingRef.current = false
          }
        }, 300)
      }
      lastScrollLeft = currentScrollLeft
    }

    checkScroll()
    container.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", checkScroll)

    return () => {
      container.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", checkScroll)
      clearTimeout(scrollTimeoutRef.current)
    }
  }, [])

  const handleCardClick = useCallback((project: WPProject) => {
    if (isScrollingRef.current) return
    // If the project has WordPress content, open modal
    if (project.content) {
      setSelectedProject(project)
    } else if (project.link && project.link !== "#") {
      // Fallback projects without content — open link directly
      window.open(project.link, "_blank", "noopener,noreferrer")
    }
  }, [])

  if (!loading && projects.length === 0) return null

  return (
    <>
      <section id="portfolio" className="bg-primary py-20 md:py-24 lg:py-28">
        <div className="container px-4 md:px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold md:text-4xl lg:text-5xl mb-6 text-white" suppressHydrationWarning>{t("projects_title")}</h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
            </div>
          ) : (

          <div className="relative">
            {/* Left Arrow */}
            <button
              onClick={handleScrollLeft}
              disabled={!canScrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/20 shadow-md hover:bg-white/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed hidden md:flex items-center justify-center"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-6 w-6 text-white" />
            </button>

            <div
              ref={scrollContainerRef}
              className="overflow-x-auto pb-4 scrollbar-hide -mx-4 md:mx-0 px-4 md:px-0 carousel-scroll"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                contain: "layout style",
              }}
            >
              <div className="flex gap-6 pb-4 min-w-max pl-4 md:pl-8 pr-4 md:pr-8 items-stretch">
                {projects.map((project) => (
                  <div key={project.id} className="project-card-wrapper first:ml-0 last:mr-0 flex items-stretch">
                    <button
                      onClick={() => handleCardClick(project)}
                      className="group block rounded-none border border-alt-gray-200 bg-white shadow-sm overflow-hidden hover:border-primary hover:shadow-md transition-shadow transition-[border-color] duration-300 flex flex-col h-full w-full text-left cursor-pointer"
                      aria-label={`View project - ${project.title}`}
                    >
                      {/* Image */}
                      <div className="w-full flex-shrink-0 relative aspect-[4/3] overflow-hidden bg-[#e3e3e3]">
                        {project.coverImage ? (
                          <Image
                            src={project.coverImage}
                            alt={project.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 768px) 288px, 320px"
                            quality={75}
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10">
                            <span className="text-primary/40 text-2xl font-bold">{project.title[0]}</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4 flex flex-col flex-1 min-h-[140px]">
                        <h3 className="text-lg font-semibold text-alt-black mb-2 text-left line-clamp-2 group-hover:text-primary transition-colors">
                          {project.title}
                        </h3>
                        <p className="text-sm text-gray-600 text-left line-clamp-2 mb-3">
                          {project.excerpt}
                        </p>
                        <div className="flex items-center text-primary font-medium mt-auto">
                          <span>{t("learn_more")}</span>
                          <ExternalLink className="w-4 h-4 ml-1" />
                        </div>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Arrow */}
            <button
              onClick={handleScrollRight}
              disabled={!canScrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/20 shadow-md hover:bg-white/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed hidden md:flex items-center justify-center"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-6 w-6 text-white" />
            </button>

            {/* Mobile arrows */}
            <div className="flex md:hidden justify-center gap-4 mt-4">
              <button
                onClick={handleScrollLeft}
                disabled={!canScrollLeft}
                className="p-2 rounded-full bg-white/20 shadow-md hover:bg-white/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-5 w-5 text-white" />
              </button>
              <button
                onClick={handleScrollRight}
                disabled={!canScrollRight}
                className="p-2 rounded-full bg-white/20 shadow-md hover:bg-white/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
          )}
        </div>
        <style jsx global>{`
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
          .carousel-scroll {
            -webkit-overflow-scrolling: touch;
            scroll-padding-left: 1rem;
            scroll-padding-right: 1rem;
          }
          @media (min-width: 768px) {
            .carousel-scroll {
              scroll-padding-left: 2rem;
              scroll-padding-right: 2rem;
            }
          }
          @media (max-width: 768px) {
            .carousel-scroll {
              -webkit-overflow-scrolling: touch;
              overflow-x: auto;
              cursor: default;
              user-select: auto;
            }
          }
          .project-card-wrapper {
            flex-shrink: 0 !important;
            flex-grow: 0 !important;
            width: 288px !important;
            min-width: 288px !important;
            max-width: 288px !important;
          }
          @media (min-width: 768px) {
            .project-card-wrapper {
              width: 320px !important;
              min-width: 320px !important;
              max-width: 320px !important;
            }
          }
          .wp-content img {
            max-width: 100%;
            height: auto;
            border-radius: 0.25rem;
          }
          .wp-content p {
            margin-bottom: 1rem;
            line-height: 1.75;
          }
          .wp-content h2, .wp-content h3, .wp-content h4 {
            font-weight: 600;
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
          }
          .wp-content ul, .wp-content ol {
            margin-bottom: 1rem;
            padding-left: 1.5rem;
          }
          .wp-content li {
            margin-bottom: 0.25rem;
          }
          .wp-content a {
            color: hsl(271 76% 53%);
            text-decoration: underline;
          }
          .wp-content blockquote {
            border-left: 4px solid hsl(271 76% 53%);
            padding-left: 1rem;
            margin: 1rem 0;
            color: #666;
            font-style: italic;
          }
        `}</style>
      </section>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
          onClick={() => setSelectedProject(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70" />

          {/* Modal */}
          <div
            className="relative bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-gray-100 transition-colors shadow-sm"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-gray-700" />
            </button>

            {/* Cover image */}
            {selectedProject.coverImage && (
              <div className="relative w-full aspect-video bg-[#e3e3e3]">
                <Image
                  src={selectedProject.coverImage}
                  alt={selectedProject.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 768px"
                  priority
                />
              </div>
            )}

            {/* Content */}
            <div className="p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {selectedProject.title}
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                {selectedProject.date ? new Date(selectedProject.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }) : ""}
              </p>

              {selectedProject.content ? (
                <div
                  className="wp-content text-gray-700 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedProject.content }}
                />
              ) : (
                <p className="text-gray-600">{selectedProject.excerpt}</p>
              )}

              {selectedProject.link && selectedProject.link !== "#" && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <a
                    href={selectedProject.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    {t("visit_project")}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
