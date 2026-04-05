import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tecxmate.com"
  
  return {
    name: 'Tecxmate - Technology Consultancy',
    short_name: 'Tecxmate',
    description: 'Technology consultancy and solutions for SMEs and Founders',
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
        src: '/icon.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      }
    ],
    categories: ['business', 'technology', 'consulting'],
    lang: 'en',
    orientation: 'portrait',
  }
}

