"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Brain, Zap, Bot, Megaphone, MonitorSmartphone, ServerCog } from "lucide-react"

export function ServicesSection() {

  const services = [
    {
      id: "ai-applications",
      icon: Brain,
      title: "AI Application Development",
      description: "Build intelligent applications powered by machine learning, natural language processing, and computer vision. From chatbots to predictive analytics, we create AI solutions that drive business value.",
    },
    {
      id: "business-automation",
      icon: Zap,
      title: "Business Automation",
      description: "Automate repetitive workflows, streamline operations, and integrate systems to boost efficiency. Reduce manual work and focus on what matters most to your business.",
    },
    {
      id: "ai-integration",
      icon: Bot,
      title: "AI Integration & Consulting",
      description: "Integrate existing AI tools into your workflow or get expert guidance on AI strategy. We help you identify automation opportunities and implement the right solutions.",
    },
    {
      id: "ai-marketing",
      icon: Megaphone,
      title: "AI Marketing and Lead Generation",
      description: "Use AI to reach the right audience, generate qualified leads, and convert them into customers. From content to campaigns and attribution, we help you grow predictably.",
    },
    {
      id: "web-dev",
      icon: MonitorSmartphone,
      title: "Company Website Design & Development",
      description: "Design and build modern, high-converting company websites that look premium, load fast, and are easy to update—optimized for founders and SME sales teams.",
    },
    {
      id: "custom-erp",
      icon: ServerCog,
      title: "Custom ERP & Operations Systems",
      description: "Replace spreadsheets and legacy tools with lightweight custom ERP-style systems tailored to your workflows—from production tracking to inventory and approvals.",
    },
  ]

  return (
    <section id="services" className="bg-white py-24 md:py-28 lg:py-32">
      <div className="container px-4 md:px-6 max-w-6xl">
            <div className="text-center mb-20 max-w-3xl mx-auto">
              <h2 className="text-3xl font-semibold md:text-4xl lg:text-5xl mb-4 tracking-tight text-gray-900">Our Services</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Technology solutions designed to work for you—from AI applications to streamlined operations.
              </p>
            </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-14">
          {services.map((service) => {
            const IconComponent = service.icon
            const accentClasses =
              service.id === "ai-applications"
                ? {
                    iconBg: "group-hover:bg-primary/10",
                    iconColor: "group-hover:text-primary",
                    link: "text-primary",
                  }
                : service.id === "business-automation"
                ? {
                    iconBg: "group-hover:bg-amber-50",
                    iconColor: "group-hover:text-amber-500",
                    link: "text-amber-600",
                  }
                : service.id === "ai-integration"
                ? {
                    iconBg: "group-hover:bg-sky-50",
                    iconColor: "group-hover:text-sky-500",
                    link: "text-sky-600",
                  }
                : service.id === "ai-marketing"
                ? {
                    iconBg: "group-hover:bg-emerald-50",
                    iconColor: "group-hover:text-emerald-600",
                    link: "text-emerald-700",
                  }
                : service.id === "web-dev"
                ? {
                    iconBg: "group-hover:bg-indigo-50",
                    iconColor: "group-hover:text-indigo-500",
                    link: "text-indigo-600",
                  }
                : service.id === "custom-erp"
                ? {
                    iconBg: "group-hover:bg-rose-50",
                    iconColor: "group-hover:text-rose-500",
                    link: "text-rose-600",
                  }
                : {
                    iconBg: "group-hover:bg-primary/10",
                    iconColor: "group-hover:text-primary",
                    link: "text-primary",
                  }

            return (
              <div
                key={service.id}
                className={`bg-gray-50/50 p-8 rounded-2xl border border-gray-100 transition-all duration-300 group flex flex-col h-full
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
                      : "hover:border-primary/30 hover:shadow-lg"
                  }`}
              >
                <div className="mb-6 flex-1">
                  <div
                    className={`w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-5 shadow-sm transition-all duration-200 ${accentClasses.iconBg}`}
                  >
                    <IconComponent
                      className={`w-6 h-6 text-alt-gray-600 transition-colors duration-200 ${accentClasses.iconColor}`}
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-alt-black mb-3">{service.title}</h3>
                  <p className="text-alt-gray-500 leading-relaxed">{service.description}</p>
                </div>
                <div className="mt-auto">
                <Link
                  href={`/services/${
                    service.id === 'ai-applications'
                      ? 'ai-application-development'
                      : service.id === 'ai-integration'
                      ? 'ai-integration-consulting'
                      : service.id === 'ai-marketing'
                      ? 'ai-marketing-lead-generation'
                      : service.id === 'web-dev'
                      ? 'website-design-development'
                      : service.id === 'custom-erp'
                      ? 'custom-erp-solutions'
                      : service.id
                  }`}
                  className={`${accentClasses.link} hover:underline text-sm font-medium inline-flex items-center`}
                >
                    Learn More →
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        <div className="text-center">
          <Button
            variant="outline"
            size="lg"
            className="border-alt-gray-200 hover:border-primary hover:text-primary transition-colors duration-200"
            asChild
          >
            <a href="https://cal.com/nikolasdoan/30min" target="_blank" rel="noopener noreferrer">
              Book a Consultation Call
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
