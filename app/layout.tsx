import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { BackToTop } from "@/components/back-to-top"
import { GoogleAnalytics } from "@/components/google-analytics"
import { FirebaseAnalytics } from "@/components/firebase-analytics"
import { GoogleTagManager } from "@/components/consent/google-tag-manager"
import { ConsentProvider } from "@/components/consent/consent-provider"
import { CookieConsent } from "@/components/consent/cookie-consent"
import { Analytics } from '@vercel/analytics/react'
import { LanguageProvider } from "@/components/language-provider"
import { generateCountryKeywords } from "@/lib/keywords"
import { readContent } from "@/lib/site-content"
import { Sora } from "next/font/google"

// The tecxmate wordmark. Only weight 700 is used; the rest of the site uses the system font.
const sora = Sora({ subsets: ["latin"], weight: "700", variable: "--font-sora", display: "swap" })

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tecxmate.com"

export async function generateMetadata(): Promise<Metadata> {
  // ISR-cached read so editable SEO doesn't force every page to render dynamically.
  const { seo } = await readContent({ revalidate: 60 })

  return {
  title: {
    default: seo.title,
    template: "%s | Tecxmate"
  },
  description: seo.description,
  generator: 'Next.js',
  keywords: generateCountryKeywords(seo.keywords),
  authors: [{ name: 'Tecxmate', url: baseUrl }],
  creator: 'Tecxmate',
  publisher: 'Tecxmate',
  metadataBase: new URL(baseUrl),
  // New file names (not /icon.png) so browsers that cached the old X fetch the new mark.
  icons: {
    icon: [
      { url: '/favicon.svg?v=3', type: 'image/svg+xml' },
      { url: '/favicon-32.png?v=3', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-192.png?v=3', sizes: '192x192', type: 'image/png' },
      { url: '/favicon-512.png?v=3', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico?v=3',
    apple: { url: '/apple-touch-icon.png?v=3', sizes: '180x180' },
  },
  alternates: {
    canonical: baseUrl,
    languages: {
      'en': baseUrl,
      'en-TW': baseUrl,
      'en-VN': baseUrl,
      'en-CN': baseUrl,
      // Note: Language routes don't exist yet - pointing to English for now
      'vi': baseUrl, // Will be `${baseUrl}/vi` when route exists
      'vi-VN': baseUrl,
      'zh': baseUrl, // Will be `${baseUrl}/zh` when route exists
      'zh-TW': baseUrl,
      'zh-CN': baseUrl,
      'x-default': baseUrl,
    },
  },
  openGraph: {
    title: seo.ogTitle,
    description: seo.ogDescription,
    url: baseUrl,
    siteName: "Tecxmate",
    locale: "en_US",
    alternateLocale: ["en_TW", "en_VN", "en_CN", "vi_VN", "zh_TW", "zh_CN"],
    type: "website",
    images: [
      {
        url: `${baseUrl}/graphics/tecxmate-logo-cropped.png`,
        width: 1200,
        height: 630,
        alt: seo.ogTitle,
        type: "image/png",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: seo.ogTitle,
    description: seo.twitterDescription,
    images: [`${baseUrl}/graphics/tecxmate-logo-cropped.png`],
    creator: seo.twitterCreator,
  },
  verification: {
    // Add when you have verification codes
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // yahoo: 'your-yahoo-verification-code',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  other: {
    'theme-color': '#8c52ff',
    'color-scheme': 'light dark',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    // Note: Geo tags are in <head> section, not in metadata.other
    // Next.js metadata.other doesn't support colons in keys like 'geo.region:VN'
  },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={sora.variable} suppressHydrationWarning>
      <head>
        <meta name="language" content="English" />
        <meta name="geo.region" content="VN" />
        <meta name="geo.placename" content="Ho Chi Minh City" />
        <meta name="geo.region:VN" content="VN" />
        <meta name="geo.region:CN" content="CN" />
        <meta name="geo.country" content="VN" />
        <meta name="rating" content="General" />
        <meta name="referrer" content="origin-when-cross-origin" />
        {/* Note: Hreflang tags are automatically generated from metadata.alternates.languages */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.googleapis.com" />
        <link rel="dns-prefetch" href="https://www.gstatic.com" />
        <link rel="preload" as="image" href="/graphics/tecxmate-logo-cropped.png" />
        <link rel="alternate" type="application/rss+xml" title="Tecxmate Blog RSS Feed" href={`${baseUrl}/feed.xml`} />
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body>
        <ConsentProvider>
          {/* Non-essential trackers below only load after cookie consent. */}
          <GoogleTagManager />
          <GoogleAnalytics />
          <FirebaseAnalytics />
          {/* Vercel Analytics is cookieless, so it needs no consent gate. Only on Vercel. */}
          {process.env.VERCEL && <Analytics />}
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <LanguageProvider>
              {children}
              <BackToTop />
              <CookieConsent />
            </LanguageProvider>
          </ThemeProvider>
        </ConsentProvider>
      </body>
    </html>
  )
}
