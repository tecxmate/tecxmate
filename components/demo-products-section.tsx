"use client"

import { ExternalLink, Smartphone, Palette, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

export function DemoProductsSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const isScrollingRef = useRef(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  // Combine all projects into a single array
  const allProjects = [
    {
      title: "EXOCAR - Luxury & Exotic Car Rental",
      description: "Luxury & Exotic Car Rental in California. Drive The Extraordinary.",
      link: "https://v0-exocar-experience.vercel.app/",
      image: "/products/exocar.png",
      icon: ExternalLink,
      actionText: "Learn More",
    },
    {
      title: "Crypted - Harvard Innovation Labs",
      description: "Pioneering Blockchain Education Platform",
      link: "https://innovationlabs.harvard.edu/venture/crypted",
      image: "/products/crypted.png",
      icon: ExternalLink,
      actionText: "Learn More",
    },
    {
      title: "Rising Star Startup Competition",
      description: "Representing Vietnamese students in Taiwanese startup competitions",
      link: "https://www.youtube.com/watch?v=uRUHCy9IGps",
      image: "/products/risingstar.png",
      icon: ExternalLink,
      actionText: "Learn More",
    },
    {
      title: "Chi Chi Vietnamese",
      description: "Premier Vietnamese Language Education for Mandarin speakers",
      link: "https://chichivietnamese.com",
      image: "/products/chichi.jpg",
      icon: ExternalLink,
      actionText: "Learn More",
    },
    {
      title: "HealthMaxers",
      description: "Performance health insights at scale",
      link: "https://healthmaxers.com",
      image: "/products/healthmaxer.png",
      icon: ExternalLink,
      actionText: "Learn More",
    },
    {
      title: "CryptED",
      description: "Gamified Blockchain and Web3 education through interactive gameplay",
      link: "https://apps.apple.com/tw/app/crypted-blockchain-education/id6747925774?l=en-GB",
      image: "/products/cryptedapp.png",
      icon: ExternalLink,
      actionText: "Learn More",
    },
    {
      title: "TailU",
      description: "Taiwan's Premier AI Pet Care Platform",
      link: "#",
      image: "/products/tailu1.png",
      icon: ExternalLink,
      actionText: "Learn More",
    },
    {
      title: "ClassZ",
      description: "Hong Kong's Premier Afterschool Center Management System",
      link: "#",
      image: "/products/classz.jpg",
      icon: ExternalLink,
      actionText: "Learn More",
    },
    {
      title: "WaterWise",
      description: "National Water Tax management system concept",
      link: "http://waterwise-eta.vercel.app",
      image: "/products/waterwise.jpg",
      icon: ExternalLink,
      actionText: "Learn More",
    },
    {
      title: "IPRPSHIELD Copyright Protection Service",
      description: "Protect your brand against counterfeits, piracy, and online threats",
      link: "https://iprpshield.com/",
      image: "/products/iprpshield.png",
      icon: ExternalLink,
      actionText: "Learn More",
    },
  ]

  // Check scroll position for arrow buttons
  const checkScroll = () => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' })
    }
  }

  // Prevent link clicks during horizontal scrolling only
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    let lastScrollLeft = container.scrollLeft
    let lastScrollTime = 0

    const handleScroll = () => {
      checkScroll()
      const currentScrollLeft = container.scrollLeft
      const now = Date.now()
      
      // Detect if horizontal scrolling occurred (use smaller threshold when zoomed)
      const threshold = 2 // Smaller threshold to work better when zoomed
      if (Math.abs(currentScrollLeft - lastScrollLeft) > threshold) {
        isScrollingRef.current = true
        lastScrollTime = now
        
        clearTimeout(scrollTimeoutRef.current)
        scrollTimeoutRef.current = setTimeout(() => {
          // Only clear if enough time has passed since last scroll
          if (Date.now() - lastScrollTime >= 250) {
            isScrollingRef.current = false
          }
        }, 300)
      }
      lastScrollLeft = currentScrollLeft
    }

    // Use event delegation to prevent clicks on links only after scroll
    const handleClick = (e: MouseEvent) => {
      // Only prevent if we were scrolling recently and it's a mouse click (not touch)
      if (isScrollingRef.current && e.type === 'click') {
        const target = e.target as HTMLElement
        const link = target.closest('a')
        if (link) {
          e.preventDefault()
          e.stopPropagation()
        }
      }
    }

    checkScroll()
    container.addEventListener('scroll', handleScroll, { passive: true })
    // Use bubble phase, not capture, to avoid interfering with scroll
    container.addEventListener('click', handleClick, false)

    // Check on resize
    window.addEventListener('resize', checkScroll)

    return () => {
      container.removeEventListener('scroll', handleScroll)
      container.removeEventListener('click', handleClick, false)
      window.removeEventListener('resize', checkScroll)
      clearTimeout(scrollTimeoutRef.current)
    }
  }, [])

  const ProjectCard = ({ project }: { project: typeof allProjects[0] }) => {
    const Icon = project.icon
    
    return (
    <Link
      href={project.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-lg border border-alt-gray-200 bg-white shadow-sm overflow-hidden hover:border-primary hover:shadow-md transition-all duration-300 flex flex-col h-full w-full"
      aria-label={`${project.actionText} - ${project.title}`}
    >
      {/* Image - Fixed aspect ratio to prevent layout shift */}
      <div className="w-full bg-[#e3e3e3] flex-shrink-0 relative aspect-[4/3] overflow-hidden">
        <Image
          src={project.image || "/placeholder.svg"}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 288px, 320px"
          quality={75}
          loading="lazy"
        />
      </div>
      
      {/* Content - Fixed height area */}
      <div className="p-4 flex flex-col flex-1 min-h-[200px]">
        <div className="flex-1 flex flex-col mb-3">
          <h3 className="text-lg font-semibold text-alt-black mb-2 text-left line-clamp-2 h-14 flex items-start group-hover:text-primary transition-colors">{project.title}</h3>
          <p className="text-sm text-gray-600 text-left line-clamp-2 h-10 flex items-start">{project.description}</p>
        </div>
        <div className="flex items-center justify-center text-primary font-medium mt-auto">
          <span>{project.actionText}</span>
          <Icon className="w-4 h-4 ml-1" />
        </div>
      </div>
    </Link>
          )
    }
  
  return (
    <section id="portfolio" className="bg-alt-gray-100 py-20 md:py-24 lg:py-28 border-t border-b border-[rgba(55,50,47,0.12)]">
      <div className="container px-4 md:px-6 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold md:text-4xl lg:text-5xl mb-6">Our Projects</h2>
        </div>

        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed hidden md:flex items-center justify-center"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-6 w-6 text-gray-700" />
          </button>

          <div 
            ref={scrollContainerRef}
            className="overflow-x-auto pb-4 scrollbar-hide -mx-4 md:mx-0 px-4 md:px-0 carousel-scroll"
            style={{ 
              WebkitOverflowScrolling: 'touch',
              transform: 'translateZ(0)',
              WebkitTapHighlightColor: 'transparent',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            <div className="flex gap-6 pb-4 min-w-max pl-4 md:pl-8 pr-4 md:pr-8 items-stretch">
              {allProjects.map((project, index) => (
                <div key={index} className="project-card-wrapper first:ml-0 last:mr-0 flex items-stretch">
                  <ProjectCard project={project} />
                </div>
              ))}
            </div>
          </div>

          {/* Right Arrow */}
          <button
            onClick={scrollRight}
            disabled={!canScrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed hidden md:flex items-center justify-center"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-6 w-6 text-gray-700" />
          </button>

          {/* Mobile arrows */}
          <div className="flex md:hidden justify-center gap-4 mt-4">
            <button
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </button>
            <button
              onClick={scrollRight}
              disabled={!canScrollRight}
              className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        </div>
      </div>
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { 
          display: none; 
        }
        .scrollbar-hide { 
          -ms-overflow-style: none; 
          scrollbar-width: none; 
        }
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
        /* Mobile: Enable native touch scrolling */
        @media (max-width: 768px) {
          .carousel-scroll {
            -webkit-overflow-scrolling: touch;
            overflow-x: auto;
            cursor: default;
            user-select: auto;
          }
        }
        /* Ensure all project cards have consistent width */
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
      `}</style>
    </section>
  )
}
