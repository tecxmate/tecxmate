import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tecxmate.com"
  
  return {
    name: 'TECXMATE',
    short_name: 'Tecxmate',
    description: 'Frontier AI-native products',
    start_url: '/',
    display: 'standalone',
    background_color: '#F6F3F1',
    theme_color: '#F6F3F1',
    icons: [
      {
        src: '/graphics/tecxmate-logo-cropped.png',
        sizes: 'any',
        type: 'image/png',
      },
      {
        src: '/favicon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/favicon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      }
    ],
    categories: ['business', 'technology', 'productivity'],
    lang: 'en',
    orientation: 'portrait',
  }
}

