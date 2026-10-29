import type { Metadata } from "next"
import { Suspense } from "react"
import SignupClient from "./SignupClient"

export const metadata: Metadata = {
  metadataBase: new URL('https://affclicker.com'),
  title: 'Join AffClicker — Become a CPC Affiliate Publisher',
  description:
    'Create your AffClicker publisher account to access CPC offers, track campaign performance, and monetize your traffic.',
  keywords: [
    'join AffClicker',
    'CPC affiliate publisher',
    'publisher signup',
    'affiliate tracking tools',
    'traffic monetization platform',
  ],
  alternates: {
    canonical: 'https://affclicker.com/signup',
  },
  openGraph: {
    title: 'Join AffClicker — Become a CPC Affiliate Publisher',
    description:
      'Create your AffClicker publisher account to access CPC offers, track campaign performance, and monetize your traffic.',
    type: 'website',
    url: 'https://affclicker.com/signup',
    siteName: 'AffClicker',
    images: [
      {
        url: 'https://affclicker.com/affclicker-preview.png',
        secureUrl: 'https://affclicker.com/affclicker-preview.png',
        width: 768,
        height: 768,
        alt: 'AffClicker Pay Per Click Affiliate Marketplace',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Join AffClicker — Become a CPC Affiliate Publisher',
    description:
      'Create your AffClicker publisher account to access CPC offers, track campaign performance, and monetize your traffic.',
    images: ['https://affclicker.com/affclicker-preview.png'],
    creator: 'AffClicker',
  },
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" aria-hidden="true" />}>
      <SignupClient />
    </Suspense>
  )
}
