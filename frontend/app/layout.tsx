import type { Metadata, Viewport } from 'next'
import { Providers } from './providers'
import './globals.css'

const SITE_URL = 'https://ergon-peach.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Ergon',
  description: 'Every Agent. Measured.',
  openGraph: {
    title: 'Ergon',
    description: 'Every Agent. Measured.',
    url: SITE_URL,
    siteName: 'Ergon',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Ergon — AI Agent ROI Tracker',
      },
    ],
    type: 'website',
  },
  icons: {
    icon: '/icon.svg',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ colorScheme: 'dark' }}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
