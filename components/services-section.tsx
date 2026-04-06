"use client"

import { Button } from "@/components/ui/button"
import { Brain, Zap, Bot, ServerCog, Smartphone, Layout } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

export function ServicesSection() {
  const { t } = useLanguage()

  const services = [
    {
      id: "mobile-app-development",
      icon: Smartphone,
      title: t("service_mobile_title"),
      description: t("service_mobile_desc"),
    },
    {
      id: "website-development",
      icon: Layout,
      title: t("service_web_title"),
      description: t("service_web_desc"),
    },
    {
      id: "ai-applications",
      icon: Brain,
      title: t("service_ai_title"),
      description: t("service_ai_desc"),
    },
    {
      id: "business-automation",
      icon: Zap,
      title: t("service_automation_title"),
      description: t("service_automation_desc"),
    },
    {
      id: "ai-integration",
      icon: Bot,
      title: t("service_consulting_title"),
      description: t("service_consulting_desc"),
    },
    {
      id: "custom-erp",
      icon: ServerCog,
      title: t("service_erp_title"),
      description: t("service_erp_desc"),
    },
  ]

  return (
    <section id="services" className="bg-white py-20 md:py-24">
      <div className="container px-4 md:px-6 max-w-6xl">
            <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
              <h2 className="text-3xl font-semibold md:text-4xl lg:text-5xl tracking-tight text-gray-900" suppressHydrationWarning>{t("services_title")}</h2>
            </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {services.map((service) => {
            const IconComponent = service.icon
            const accentClasses =
              service.id === "mobile-app-development"
                ? { iconBg: "group-hover:bg-blue-50", iconColor: "group-hover:text-blue-500" }
                : service.id === "website-development"
                ? { iconBg: "group-hover:bg-sky-50", iconColor: "group-hover:text-sky-500" }
                : service.id === "ai-applications"
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
                className={`bg-gray-50/50 p-5 md:p-6 rounded-none border border-gray-100 transition-all duration-300 group flex flex-col h-full
                  ${
                    service.id === "mobile-app-development"
                      ? "hover:border-blue-400/60 hover:shadow-[0_0_40px_rgba(59,130,246,0.25)]"
                      : service.id === "website-development"
                      ? "hover:border-sky-400/60 hover:shadow-[0_0_40px_rgba(56,189,248,0.25)]"
                      : service.id === "ai-applications"
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
                <div className="mb-3 flex-1">
                  <div
                    className={`w-10 h-10 bg-white rounded-none flex items-center justify-center mb-3 shadow-sm transition-all duration-200 ${accentClasses.iconBg}`}
                  >
                    <IconComponent
                      className={`w-5 h-5 text-alt-gray-600 transition-colors duration-200 ${accentClasses.iconColor}`}
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-alt-black mb-2">{service.title}</h3>
                  <p className="text-alt-gray-500 leading-relaxed text-sm">{service.description}</p>
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
              {t("book_consultation")}
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
