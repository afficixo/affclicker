import type { Metadata } from "next";
import { Suspense } from "react";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  metadataBase: new URL('https://affclicker.com'),
  title: 'Manager Login — AffClicker',
  description:
    'Log in to your AffClicker publisher account to manage CPC offers, tracking links, traffic analytics, and earnings.',
  keywords: [
    'manager login',
    'AffClicker login',
    'affiliate dashboard',
    'offer management login',
    'click tracking login',
  ],
  alternates: {
    canonical: 'https://affclicker.com/login',
  },
  openGraph: {
    title: 'Manager Login — AffClicker',
    description:
      'Log in to your AffClicker publisher account to manage CPC offers, tracking links, traffic analytics, and earnings.',
    type: 'website',
    url: 'https://affclicker.com/login',
    siteName: 'AffClicker',
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
    title: 'Manager Login — AffClicker',
    description:
      'Log in to your AffClicker publisher account to manage CPC offers, tracking links, traffic analytics, and earnings.',
    images: ['https://partner.afficix.com/affclicker-preview-20261031.png'],
    creator: 'AffClicker',
  },
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" aria-hidden="true" />}>
      <LoginClient />
    </Suspense>
  );
}
