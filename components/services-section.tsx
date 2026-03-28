"use client"

import { Button } from "@/components/ui/button"
import { Brain, Zap, Bot, ServerCog } from "lucide-react"

export function ServicesSection() {

  const services = [
    {
      id: "ai-applications",
      icon: Brain,
      title: "AI Application Development",
      description: "ML, NLP, and computer vision solutions — from chatbots to predictive analytics.",
    },
    {
      id: "business-automation",
      icon: Zap,
      title: "Business Automation",
      description: "Workflow automation, system integration, and operational streamlining.",
    },
    {
      id: "ai-integration",
      icon: Bot,
      title: "AI Integration & Consulting",
      description: "AI strategy, tool selection, and hands-on implementation support.",
    },
    {
      id: "custom-erp",
      icon: ServerCog,
      title: "Custom ERP & Operations Systems",
      description: "Lightweight ERP systems built around your actual workflows.",
    },
  ]

  return (
    <section id="services" className="bg-white py-24 md:py-28 lg:py-32">
      <div className="container px-4 md:px-6 max-w-6xl">
            <div className="text-center mb-20 max-w-3xl mx-auto">
              <h2 className="text-3xl font-semibold md:text-4xl lg:text-5xl tracking-tight text-gray-900">Our Services</h2>
            </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-14">
          {services.map((service) => {
            const IconComponent = service.icon
            const accentClasses =
              service.id === "ai-applications"
                ? { iconBg: "group-hover:bg-primary/10", iconColor: "group-hover:text-primary" }
                : service.id === "business-automation"
                ? { iconBg: "group-hover:bg-amber-50", iconColor: "group-hover:text-amber-500" }
                : service.id === "ai-integration"
                ? { iconBg: "group-hover:bg-sky-50", iconColor: "group-hover:text-sky-500" }
                : service.id === "custom-erp"
                ? { iconBg: "group-hover:bg-rose-50", iconColor: "group-hover:text-rose-500" }
                : { iconBg: "group-hover:bg-primary/10", iconColor: "group-hover:text-primary" }

            return (
              <div
                key={service.id}
                className={`bg-gray-50/50 p-8 rounded-none border border-gray-100 transition-all duration-300 group flex flex-col h-full
                  ${
                    service.id === "ai-applications"
                      ? "hover:border-primary/40 hover:shadow-[0_0_40px_rgba(139,92,246,0.28)]"
                      : service.id === "business-automation"
                      ? "hover:border-amber-400/60 hover:shadow-[0_0_40px_rgba(245,158,11,0.25)]"
                      : service.id === "ai-integration"
                      ? "hover:border-sky-400/60 hover:shadow-[0_0_40px_rgba(56,189,248,0.25)]"
                      : service.id === "custom-erp"
                      ? "hover:border-rose-400/60 hover:shadow-[0_0_40px_rgba(244,114,182,0.25)]"
                      : "hover:border-primary/30 hover:shadow-lg"
                  }`}
              >
                <div className="mb-6 flex-1">
                  <div
                    className={`w-14 h-14 bg-white rounded-none flex items-center justify-center mb-5 shadow-sm transition-all duration-200 ${accentClasses.iconBg}`}
                  >
                    <IconComponent
                      className={`w-6 h-6 text-alt-gray-600 transition-colors duration-200 ${accentClasses.iconColor}`}
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-alt-black mb-3">{service.title}</h3>
                  <p className="text-alt-gray-500 leading-relaxed">{service.description}</p>
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
