import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Brain, Zap, Bot, Megaphone, MonitorSmartphone, ServerCog, ArrowRight } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"
import Script from "next/script"
import { generateCountryKeywords } from "@/lib/keywords"

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tecxmate.com"

export const metadata: Metadata = {
  title: "Our Services - AI Development, Business Automation & Tech Consulting | Tecxmate",
  description: "Discover Tecxmate's comprehensive technology services: AI application development, business automation, AI integration consulting, and digital transformation. Expert solutions for SMEs and startups.",
  keywords: generateCountryKeywords([
    "AI development services",
    "business automation",
    "AI integration consulting",
    "technology consultancy",
    "digital transformation",
    "machine learning development",
    "workflow automation",
    "tech consulting services",
    "SME technology solutions",
    "startup tech consulting"
  ]),
  alternates: {
    canonical: `${baseUrl}/services`,
      languages: {
        'en': `${baseUrl}/services`,
        'en-TW': `${baseUrl}/services`,
        'en-VN': `${baseUrl}/services`,
        'en-CN': `${baseUrl}/services`,
        // Note: Language routes don't exist yet - pointing to English for now
        'vi': `${baseUrl}/services`, // Will be `${baseUrl}/vi/services` when route exists
        'vi-VN': `${baseUrl}/services`,
        'zh': `${baseUrl}/services`, // Will be `${baseUrl}/zh/services` when route exists
        'zh-TW': `${baseUrl}/services`,
        'zh-CN': `${baseUrl}/services`,
        'x-default': `${baseUrl}/services`,
      },
  },
  openGraph: {
    title: "Our Services - AI Development, Business Automation & Tech Consulting | Tecxmate",
    description: "Discover Tecxmate's comprehensive technology services: AI application development, business automation, AI integration consulting, and digital transformation.",
    url: `${baseUrl}/services`,
    siteName: "Tecxmate",
    locale: "en_US",
    alternateLocale: ["en_TW", "en_VN", "en_CN", "vi_VN", "zh_TW", "zh_CN"],
    type: "website",
    images: [
      {
        url: `${baseUrl}/tecxmate-logo-cropped.png`,
        width: 1200,
        height: 630,
        alt: "Tecxmate Services - AI Development and Business Automation",
        type: "image/png",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Services - AI Development, Business Automation & Tech Consulting | Tecxmate",
    description: "Discover Tecxmate's comprehensive technology services: AI application development, business automation, and digital transformation.",
    images: [`${baseUrl}/tecxmate-logo-cropped.png`],
  },
}

const services = [
  {
    id: "ai-applications",
    slug: "ai-application-development",
    icon: Brain,
    title: "AI Application Development",
    description: "Build intelligent applications powered by machine learning, natural language processing, and computer vision. From chatbots to predictive analytics, we create AI solutions that drive business value.",
    features: [
      "Machine Learning & Deep Learning",
      "Natural Language Processing (NLP)",
      "Computer Vision Solutions",
      "Predictive Analytics",
      "Chatbots & Virtual Assistants",
      "Custom AI Solutions"
    ],
  },
  {
    id: "business-automation",
    slug: "business-automation",
    icon: Zap,
    title: "Business Automation",
    description: "Automate repetitive workflows, streamline operations, and integrate systems to boost efficiency. Reduce manual work and focus on what matters most to your business.",
    features: [
      "Workflow Automation",
      "System Integration",
      "Process Optimization",
      "API Development",
      "Data Pipeline Automation",
      "Custom Automation Solutions"
    ],
  },
  {
    id: "ai-integration",
    slug: "ai-integration-consulting",
    icon: Bot,
    title: "AI Integration & Consulting",
    description: "Integrate existing AI tools into your workflow or get expert guidance on AI strategy. We help you identify automation opportunities and implement the right solutions.",
    features: [
      "AI Strategy Consulting",
      "Tool Integration",
      "AI Implementation",
      "Performance Optimization",
      "Training & Support",
      "AI Roadmap Planning"
    ],
  },
  {
    id: "ai-marketing",
    slug: "ai-marketing-lead-generation",
    icon: Megaphone,
    title: "AI Marketing and Lead Generation",
    description: "Use AI to reach the right audience, generate qualified leads, and convert them into customers. From content creation to campaigns and attribution, we help you grow predictably.",
    features: [
      "AI-powered content creation and copy optimization",
      "Lead generation funnels and landing page optimization",
      "Campaign automation and multi-channel orchestration",
      "Lead scoring and CRM integration",
      "Attribution and ROI tracking",
      "Personalization and audience segmentation"
    ],
  },
  {
    id: "web-dev",
    slug: "website-design-development",
    icon: MonitorSmartphone,
    title: "Company Website Design & Development",
    description: "Design and build modern company websites that feel premium, convert visitors, and are simple for your team to update without a full-time developer.",
    features: [
      "Brand-aligned UX/UI design",
      "High-performance, mobile-first implementation",
      "Optimized landing pages for lead generation",
      "CMS setup so non-technical staff can edit content",
      "Analytics and tracking baked into the site",
      "SEO-friendly structure and technical setup",
    ],
  },
  {
    id: "custom-erp",
    slug: "custom-erp-solutions",
    icon: ServerCog,
    title: "Custom ERP & Operations Systems",
    description: "Build lightweight, custom ERP-style systems that match how your team actually works—from production tracking to inventory, purchasing, and approvals.",
    features: [
      "Requirements discovery and workflow mapping",
      "Modular ERP-style system design",
      "Production, inventory, and order tracking modules",
      "Role-based access and approval flows",
      "Integrations with existing tools (Excel, accounting, MES)",
      "Dashboards and reports tailored to leadership KPIs",
    ],
  },
]

export default function ServicesPage() {
  const servicesStructuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Tecxmate Services",
    "description": "Comprehensive technology services including AI development, business automation, and AI integration consulting",
    "itemListElement": services.map((service, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Service",
        "name": service.title,
        "description": service.description,
        "url": `${baseUrl}/services/${service.slug}`,
        "provider": {
          "@type": "ProfessionalService",
          "name": "Tecxmate"
        }
      }
    }))
  }

  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Services",
        "item": `${baseUrl}/services`
      }
    ]
  }

  return (
    <>
      <Script
        id="services-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesStructuredData) }}
      />
      <Script
        id="services-breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />
      <div className="min-h-screen bg-white">
        <Navbar />
        <main>
          <section className="bg-primary/5 py-16 md:py-24">
            <div className="container px-4 md:px-6">
              <div className="mx-auto max-w-3xl text-center">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">
                  Our Services
                </h1>
                <p className="text-lg text-gray-600 md:text-xl/relaxed">
                  Comprehensive technology solutions to transform your business. From AI development to business automation, we deliver innovative solutions tailored to your needs.
                </p>
              </div>
            </div>
          </section>

          <section className="py-12 md:py-16">
            <div className="container px-4 md:px-6 max-w-6xl">
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => {
                  const IconComponent = service.icon
                  const accentClasses =
                    service.id === "ai-applications"
                      ? {
                          iconBg: "bg-primary/10",
                          iconColor: "text-primary",
                          bullet: "text-primary",
                          button: "border-primary text-primary",
                        }
                      : service.id === "business-automation"
                      ? {
                          iconBg: "bg-amber-50",
                          iconColor: "text-amber-500",
                          bullet: "text-amber-500",
                          button: "border-amber-400 text-amber-600",
                        }
                      : service.id === "ai-integration"
                      ? {
                          iconBg: "bg-sky-50",
                          iconColor: "text-sky-500",
                          bullet: "text-sky-500",
                          button: "border-sky-400 text-sky-600",
                        }
                      : service.id === "ai-marketing"
                      ? {
                          iconBg: "bg-emerald-50",
                          iconColor: "text-emerald-600",
                          bullet: "text-emerald-600",
                          button: "border-emerald-400 text-emerald-700",
                        }
                      : service.id === "web-dev"
                      ? {
                          iconBg: "bg-indigo-50",
                          iconColor: "text-indigo-500",
                          bullet: "text-indigo-500",
                          button: "border-indigo-400 text-indigo-600",
                        }
                      : service.id === "custom-erp"
                      ? {
                          iconBg: "bg-rose-50",
                          iconColor: "text-rose-500",
                          bullet: "text-rose-500",
                          button: "border-rose-400 text-rose-600",
                        }
                      : {
                          iconBg: "bg-primary/10",
                          iconColor: "text-primary",
                          bullet: "text-primary",
                          button: "border-primary text-primary",
                        }
                  return (
                    <div
                      key={service.id}
                      className={`bg-white p-8 rounded-lg border border-gray-200 shadow-sm transition-all duration-300 flex flex-col
                        ${
                          service.id === "ai-applications"
                            ? "hover:border-primary/40 hover:shadow-[0_0_40px_rgba(139,92,246,0.28)]"
                            : service.id === "business-automation"
                            ? "hover:border-amber-400/60 hover:shadow-[0_0_40px_rgba(245,158,11,0.25)]"
                            : service.id === "ai-integration"
                            ? "hover:border-sky-400/60 hover:shadow-[0_0_40px_rgba(56,189,248,0.25)]"
                            : service.id === "ai-marketing"
                            ? "hover:border-emerald-400/60 hover:shadow-[0_0_40px_rgba(52,211,153,0.25)]"
                            : service.id === "web-dev"
                            ? "hover:border-indigo-400/60 hover:shadow-[0_0_40px_rgba(129,140,248,0.25)]"
                            : service.id === "custom-erp"
                            ? "hover:border-rose-400/60 hover:shadow-[0_0_40px_rgba(244,114,182,0.25)]"
                            : "hover:border-primary hover:shadow-md"
                        }`}
                    >
                      <div className="mb-6">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${accentClasses.iconBg}`}
                        >
                          <IconComponent className={`w-6 h-6 ${accentClasses.iconColor}`} />
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">{service.title}</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">{service.description}</p>
                      </div>
                      <div className="flex-1 mb-6">
                        <ul className="space-y-2">
                          {service.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start text-sm text-gray-600">
                              <span className={`${accentClasses.bullet} mr-2`}>•</span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Link href={`/services/${service.slug}`}>
                        <Button variant="outline" className={`w-full group ${accentClasses.button}`}>
                          Learn More
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </Link>
                    </div>
                  )
                })}
              </div>

              <div className="mt-12 text-center">
                <Button size="lg" className="bg-primary hover:bg-primary-dark text-white" asChild>
                  <a href="https://cal.com/nikolasdoan/30min" target="_blank" rel="noopener noreferrer">
                    Book a Free Consultation
                  </a>
                </Button>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  )
}
