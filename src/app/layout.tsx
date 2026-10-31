import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import PageTransition from '@/components/ui/PageTransition'
import ThemeInitializer from '@/components/ui/ThemeInitializer'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  applicationName: 'AffClicker',
  metadataBase: new URL('https://affclicker.com'),
  title: 'AffClicker — CPC Affiliate Marketplace for Publishers',
  description:
    'AffClicker is a CPC affiliate marketplace for publishers. Discover high-paying pay-per-click offers, track valid clicks, and monetize your traffic worldwide.',
  keywords: [
    'CPC affiliate marketplace',
    'pay per click offers',
    'affiliate network',
    'publisher network',
    'click tracking',
    'traffic monetization',
    'affiliate marketing platform',
    'earn per click',
    'AffClicker',
    'CPC advertising network',
    'affiliate links',
    'campaign management',
    'valid clicks',
    'publisher earnings',
    'online monetization',
    'performance marketing',
    'publisher platform',
    'affiliate offers',
  ],
  authors: [{ name: 'AffClicker', url: 'https://affclicker.com' }],
  creator: 'AffClicker',
  publisher: 'AffClicker',
  category: 'Business',
  referrer: 'strict-origin-when-cross-origin',
  formatDetection: {
    email: false,
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'AffClicker',
  },
  alternates: {
    canonical: 'https://affclicker.com',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: [
      { url: '/affclicker-favicon-20261031.png', type: 'image/png', sizes: '768x768' },
    ],
    apple: [{ url: '/affclicker-favicon-20261031.png', type: 'image/png', sizes: '768x768' }],
    shortcut: '/affclicker-favicon-20261031.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'AffClicker — Pay Per Click Affiliate Marketplace',
    description:
      'Discover CPC affiliate offers on AffClicker. Promote campaigns, track traffic, and earn from valid clicks.',
    type: 'website',
    url: 'https://affclicker.com',
    siteName: 'AffClicker',
    locale: 'en_US',
    images: [
      {
        url: 'https://partner.afficix.com/affclicker-preview-20261031.png',
        secureUrl: 'https://partner.afficix.com/affclicker-preview-20261031.png',
        width: 768,
        height: 768,
        alt: 'AffClicker Pay Per Click Affiliate Marketplace',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AffClicker — CPC Affiliate Marketplace',
    description:
      'Discover CPC offers, promote campaigns, track valid clicks, and monetize your traffic with AffClicker.',
    images: ['https://partner.afficix.com/affclicker-preview-20261031.png'],
    site: '@affclicker',
    creator: '@affclicker',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#34d399' },
    { media: '(prefers-color-scheme: light)', color: '#34d399' },
  ],
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.variable} font-sans antialiased`}>
        <ThemeInitializer />
        <div className="min-h-screen">
          <PageTransition>{children}</PageTransition>
        </div>
      </body>
    </html>
  )
}