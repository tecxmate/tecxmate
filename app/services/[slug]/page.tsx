import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ContactFormTrigger } from "@/components/contact-form-trigger"
import { Brain, Zap, Bot, Megaphone, MonitorSmartphone, ServerCog, ArrowLeft, Check, TrendingUp, Users } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"
import Script from "next/script"
import { notFound } from "next/navigation"

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tecxmate.com"

const services = {
  "ai-application-development": {
    id: "ai-applications",
    icon: Brain,
    title: "AI Application Development",
    description: "Build intelligent applications powered by machine learning, natural language processing, and computer vision. From chatbots to predictive analytics, we create AI solutions that drive business value.",
    longDescription: "Transform your business with cutting-edge AI applications. Our team specializes in developing intelligent solutions that leverage machine learning, natural language processing, and computer vision to solve real-world business challenges. Whether you need chatbots, predictive analytics, or custom AI solutions, we deliver applications that drive measurable business value.",
    valueOutcomes: {
      moreCustomers: [
        "Reach and convert more leads with 24/7 AI chatbots and personalized experiences that don’t scale with headcount.",
        "Keep more customers with smarter recommendations, faster support, and experiences that feel tailored to each user.",
        "Win new segments by launching digital products and intelligent features that set you apart from competitors.",
      ],
      moreRevenue: [
        "Increase conversion and average order value through personalization, smart recommendations, and frictionless flows.",
        "Turn data into new revenue streams—predictive insights, premium features, or automated services that customers pay for.",
        "Grow revenue without growing cost linearly; scale to many more users with the same or smaller team.",
      ],
    },
    features: [
      "Machine Learning & Deep Learning Models",
      "Natural Language Processing (NLP)",
      "Computer Vision & Image Recognition",
      "Predictive Analytics & Forecasting",
      "Chatbots & Virtual Assistants",
      "Custom AI Solution Development",
      "AI Model Training & Optimization",
      "API Integration & Deployment"
    ],
    benefits: [
      "Improved decision-making through data insights",
      "Enhanced customer experience with AI-powered interactions",
      "Reduced operational costs through automation",
      "Scalable solutions that grow with your business",
      "Competitive advantage through innovation"
    ],
    useCases: [
      "Customer service chatbots",
      "Predictive maintenance systems",
      "Image and document recognition",
      "Personalized recommendation engines",
      "Fraud detection systems",
      "Supply chain optimization"
    ],
  },
  "business-automation": {
    id: "business-automation",
    icon: Zap,
    title: "Business Automation",
    description: "Automate repetitive workflows, streamline operations, and integrate systems to boost efficiency. Reduce manual work and focus on what matters most to your business.",
    longDescription: "Streamline your business operations with intelligent automation solutions. We help you identify repetitive tasks, automate workflows, and integrate systems to maximize efficiency. From data entry automation to complex workflow orchestration, our solutions reduce manual work and free up your team to focus on strategic initiatives.",
    valueOutcomes: {
      moreCustomers: [
        "Serve more customers without adding staff—automate onboarding, follow-ups, and support so every lead gets a fast, consistent experience.",
        "Win and retain more accounts by responding faster, reducing errors, and delivering a professional, reliable impression at scale.",
        "Reallocate your team to high-value activities (sales, relationships, strategy) that directly grow your customer base.",
      ],
      moreRevenue: [
        "Cut operational cost and errors so more of every dollar becomes profit; typical projects deliver 20–40% time savings on automated processes.",
        "Handle higher volume without proportional headcount—grow revenue while keeping margins healthy.",
        "Scale repeatably: once workflows are automated, adding new customers or orders costs far less per unit.",
      ],
    },
    features: [
      "Workflow Automation & Orchestration",
      "System Integration & API Development",
      "Process Optimization & Reengineering",
      "Data Pipeline Automation",
      "Custom Automation Solutions",
      "RPA (Robotic Process Automation)",
      "Business Process Management",
      "Third-party Tool Integration"
    ],
    benefits: [
      "Significant time savings on repetitive tasks",
      "Reduced human errors and improved accuracy",
      "Enhanced productivity and efficiency",
      "Better resource allocation",
      "Scalable processes that adapt to growth"
    ],
    useCases: [
      "Invoice processing automation",
      "Customer onboarding workflows",
      "Data migration and synchronization",
      "Report generation and distribution",
      "Inventory management automation",
      "Email and communication automation"
    ],
  },
  "ai-integration-consulting": {
    id: "ai-integration",
    icon: Bot,
    title: "AI Integration & Consulting",
    description: "Integrate existing AI tools into your workflow or get expert guidance on AI strategy. We help you identify automation opportunities and implement the right solutions.",
    longDescription: "Get expert guidance on AI strategy and implementation. Whether you want to integrate existing AI tools into your workflow or develop a comprehensive AI roadmap, our consultants help you identify opportunities, evaluate solutions, and implement the right AI technologies for your business needs.",
    valueOutcomes: {
      moreCustomers: [
        "Deploy AI that actually gets used—we align tools with your sales and marketing flow so you convert and retain more leads.",
        "Differentiate with AI-powered experiences (support, content, recommendations) that attract and keep customers.",
        "Build a clear roadmap so your team can sell and deliver AI-backed value without guesswork or wasted effort.",
      ],
      moreRevenue: [
        "Get to revenue faster: we help you pick and implement the right AI so you see ROI in months, not years.",
        "Avoid costly mistakes—wrong tools, underused licenses, or dead-end pilots; our guidance maximizes return on every AI dollar.",
        "Turn AI into a repeatable advantage: better margins, higher throughput, and offerings that justify premium pricing.",
      ],
    },
    features: [
      "AI Strategy Consulting & Planning",
      "AI Tool Evaluation & Selection",
      "AI Integration & Implementation",
      "Performance Optimization & Tuning",
      "Training & Knowledge Transfer",
      "AI Roadmap Development",
      "ROI Analysis & Business Case Development",
      "Ongoing Support & Maintenance"
    ],
    benefits: [
      "Strategic AI implementation aligned with business goals",
      "Reduced implementation risks",
      "Faster time to value",
      "Expert guidance throughout the process",
      "Long-term AI strategy and roadmap"
    ],
    useCases: [
      "AI tool selection and evaluation",
      "Integrating ChatGPT/Claude into workflows",
      "Developing AI adoption strategies",
      "AI performance optimization",
      "AI training and change management",
      "Building AI capabilities within your team"
    ],
  },
  "ai-marketing-lead-generation": {
    id: "ai-marketing",
    icon: Megaphone,
    title: "AI Marketing and Lead Generation",
    description: "Use AI to reach the right audience, generate qualified leads, and convert them into customers. From content creation to campaigns and attribution, we help you grow predictably.",
    longDescription:
      "Stop guessing which content and campaigns work. We help you use AI to create high-converting content, run targeted lead generation campaigns, and turn prospects into customers. From landing pages and funnels to CRM integration and attribution, we build systems that scale your pipeline without scaling headcount.",
    valueOutcomes: {
      moreCustomers: [
        "Attract more qualified leads with AI-optimized content and targeted campaigns across search, social, and email.",
        "Convert more visitors with personalized experiences, smart forms, and conversion-focused landing pages.",
        "Build a predictable pipeline with lead scoring, nurture sequences, and clear attribution."
      ],
      moreRevenue: [
        "Reduce cost per lead by automating content creation and campaign optimization with AI.",
        "Increase deal velocity with CRM integration, lead routing, and sales-ready insights.",
        "Scale marketing without linear headcount—use AI and automation to do more with less."
      ]
    },
    features: [
      "AI-powered content creation and copy optimization",
      "Lead generation funnels and landing page optimization",
      "Campaign automation and multi-channel orchestration",
      "Lead scoring and CRM integration",
      "Attribution and ROI tracking",
      "Personalization and audience segmentation"
    ],
    benefits: [
      "Predictable pipeline growth with data-driven campaigns",
      "Higher-quality leads through better targeting and segmentation",
      "Faster time-to-lead with automated funnels and nurturing",
      "Clear visibility into what drives revenue",
      "Marketing systems that scale with your business"
    ],
    useCases: [
      "B2B company needing a steady flow of qualified leads and demo bookings",
      "SaaS or service business wanting to automate content and campaign optimization",
      "Startup scaling marketing without hiring a full team",
      "Established brand modernizing lead gen with AI and automation"
    ]
  },
  "website-design-development": {
    id: "web-dev",
    icon: MonitorSmartphone,
    title: "Company Website Design & Development",
    description:
      "Design and build modern, conversion-focused company websites that look premium, load fast, and are easy for your team to keep up to date.",
    longDescription:
      "Your website is often the first serious conversation customers have with your company. We design and build modern, founder-friendly websites that tell your story clearly, look premium on every device, and are simple for your team to update without relying on a full-time developer. From structure and messaging to performance and analytics, we treat your website as a core sales asset, not just a brochure.",
    valueOutcomes: {
      moreCustomers: [
        "Make a strong first impression with a premium, on-brand website that builds trust with international partners and buyers.",
        "Increase conversions with clear messaging, focused landing pages, and obvious next steps for visitors.",
        "Support more markets with multilingual-ready structures and content layouts.",
      ],
      moreRevenue: [
        "Turn your website into a pipeline driver—optimize for demo bookings, quote requests, and discovery calls.",
        "Reduce developer dependency and content bottlenecks so marketing and leadership can ship updates faster.",
        "Use analytics and tracking to understand which pages and campaigns actually move revenue.",
      ],
    },
    features: [
      "UX and information architecture tailored to founders and B2B buyers",
      "Responsive, high-performance implementation for mobile and desktop",
      "CMS setup (e.g. headless or WordPress) so non-technical staff can edit content",
      "Conversion-focused landing pages and forms",
      "Analytics, basic SEO, and tracking integrated from day one",
      "Design system and components that can grow with new pages",
    ],
    benefits: [
      "Professional, modern brand presence that supports sales conversations",
      "Faster time from idea to live page without heavy engineering involvement",
      "Better insight into which content and campaigns work",
      "A website foundation that can be extended as you add products and markets",
    ],
    useCases: [
      "SME upgrading from a legacy or DIY website to a professional presence",
      "Founders needing a credible English-language site for overseas partners",
      "Companies launching a new product line and needing focused landing pages",
      "Teams wanting a CMS-driven site so marketing can ship updates independently",
    ],
  },
  "custom-erp-solutions": {
    id: "custom-erp",
    icon: ServerCog,
    title: "Custom ERP & Operations Systems",
    description:
      "Design and implement lightweight, custom ERP-style systems that match how your factory or team actually works.",
    longDescription:
      "Off-the-shelf ERPs are often too heavy, too rigid, or too expensive for growing manufacturers and service teams. We design and build custom ERP-style systems that match your real workflows—from orders and production tracking to inventory, purchasing, and approvals. The result is an operations backbone that your team actually adopts, because it fits how they work instead of forcing them into someone else’s template.",
    valueOutcomes: {
      moreCustomers: [
        "Serve more customers with the same team by reducing manual coordination, status chasing, and spreadsheet work.",
        "Deliver a more consistent, reliable experience across orders and projects, improving customer trust and retention.",
        "Onboard new staff faster with clear, systemized processes.",
      ],
      moreRevenue: [
        "Reduce leakage and errors (lost orders, wrong quantities, missed follow-ups) that quietly destroy margin.",
        "Unlock real-time visibility into production, inventory, and WIP so leadership can make faster decisions.",
        "Scale to higher order volumes without needing to scale headcount at the same rate.",
      ],
    },
    features: [
      "Process discovery and system design tailored to your factory or team",
      "Order, production, and inventory tracking modules",
      "Role-based access, approvals, and audit trails",
      "Integrations with existing tools (accounting, spreadsheets, MES, chat)",
      "Dashboards and reports focused on utilization, throughput, and bottlenecks",
      "Cloud-hosted or on-premise deployment options",
    ],
    benefits: [
      "A system your team actually uses because it fits your workflow",
      "Less time lost to searching, reconciling, and double entry",
      "Higher data accuracy for planning, purchasing, and sales",
      "Stronger operational foundation for future automation and analytics",
    ],
    useCases: [
      "Factory replacing spreadsheet-based production and inventory tracking",
      "Service team needing a tailored job/engagement tracking system",
      "Operations leaders wanting a lighter alternative to big-name ERPs",
      "Companies planning future automation and needing a clean system of record first",
    ],
  },
}

export async function generateStaticParams() {
  return Object.keys(services).map((slug) => ({
    slug,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const service = services[slug as keyof typeof services]

  if (!service) {
    return {
      title: "Service Not Found | Tecxmate",
    }
  }

  return {
    title: `${service.title} - Expert Services | Tecxmate`,
    description: service.description,
    keywords: [
      service.title.toLowerCase(),
      "technology consultancy",
      "SME solutions",
      "business automation",
      "AI development",
      "digital transformation",
      "tech consulting",
    ].join(", "),
    alternates: {
      canonical: `${baseUrl}/services/${slug}`,
    },
    openGraph: {
      title: `${service.title} - Expert Services | Tecxmate`,
      description: service.description,
      url: `${baseUrl}/services/${slug}`,
      siteName: "Tecxmate",
      locale: "en_US",
      type: "website",
      images: [
        {
          url: `${baseUrl}/tecxmate-logo-cropped.png`,
          width: 1200,
          height: 630,
          alt: `${service.title} - Tecxmate`,
          type: "image/png",
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${service.title} - Expert Services | Tecxmate`,
      description: service.description,
      images: [`${baseUrl}/tecxmate-logo-cropped.png`],
    },
  }
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const service = services[slug as keyof typeof services]

  if (!service) {
    notFound()
  }

  const IconComponent = service.icon
  const isAIMarketing = service.id === "ai-marketing"

  const serviceStructuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.title,
    "description": service.longDescription,
    "provider": {
      "@type": "ProfessionalService",
      "name": "Tecxmate",
      "url": baseUrl,
    },
    "areaServed": {
      "@type": "Country",
      "name": "Worldwide"
    },
    "serviceType": service.title,
    "url": `${baseUrl}/services/${slug}`,
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
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": service.title,
        "item": `${baseUrl}/services/${slug}`
      }
    ]
  }

  return (
    <>
      <Script
        id="service-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceStructuredData) }}
      />
      <Script
        id="service-breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />
      <div className="min-h-screen bg-white">
        <Navbar />
        <main>
          <section className={isAIMarketing ? "bg-emerald-50 py-16 md:py-24" : "bg-primary/5 py-16 md:py-24"}>
            <div className="container px-4 md:px-6">
              <Link href="/services" className="inline-flex items-center gap-2 text-primary hover:underline mb-8">
                <ArrowLeft className="h-4 w-4" />
                Back to All Services
              </Link>
              <div className="mx-auto max-w-3xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className={isAIMarketing ? "w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center" : "w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center"}>
                    <IconComponent className={isAIMarketing ? "w-8 h-8 text-emerald-600" : "w-8 h-8 text-primary"} />
                  </div>
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                    {service.title}
                  </h1>
                </div>
                <p className="text-lg text-gray-600 md:text-xl/relaxed mb-8">
                  {service.longDescription}
                </p>
              </div>
            </div>
          </section>

          <section className="py-12 md:py-16">
            <div className="container px-4 md:px-6 max-w-6xl">
              <div className="grid gap-12 md:grid-cols-2">
                <div>
                  <h2 className="text-2xl font-semibold mb-6">Key Features</h2>
                  <ul className="space-y-3">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <Check className={isAIMarketing ? "h-5 w-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" : "h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0"} />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold mb-6">Benefits</h2>
                  <ul className="space-y-3">
                    {service.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start">
                        <Check className={isAIMarketing ? "h-5 w-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" : "h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0"} />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-12">
                <h2 className="text-2xl font-semibold mb-6">Common Use Cases</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {service.useCases.map((useCase, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-gray-700">{useCase}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-12 text-center">
                <ContactFormTrigger
                  size="lg"
                  className={isAIMarketing ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-primary hover:bg-primary-dark text-white"}
                >
                  Book a Call
                </ContactFormTrigger>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  )
}

