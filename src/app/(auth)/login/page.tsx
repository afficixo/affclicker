import type { Metadata } from "next";
import { Suspense } from "react";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  metadataBase: new URL('https://afficix.com'),
  title: 'Manager Login — Afficixo',
  description:
    'Log in to your Afficixo publisher account to manage offers, affiliate links, traffic, clicks, analytics, and earnings.',
  keywords: [
    'manager login',
    'Afficixo login',
    'affiliate dashboard',
    'offer management login',
    'click tracking login',
  ],
  alternates: {
    canonical: 'https://afficix.com/login',
  },
  openGraph: {
    title: 'Manager Login — Afficixo',
    description:
      'Log in to your Afficixo publisher account to manage offers, affiliate links, traffic, clicks, analytics, and earnings.',
    type: 'website',
    url: 'https://afficix.com/login',
    siteName: 'Afficixo',
    images: [
      {
        url: 'https://afficix.com/og.png',
        secureUrl: 'https://afficix.com/og.png',
        width: 1200,
        height: 630,
        alt: 'Afficixo Pay Per Click Affiliate Marketplace',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Manager Login — Afficixo',
    description:
      'Log in to your Afficixo publisher account to manage offers, affiliate links, traffic, clicks, analytics, and earnings.',
    images: ['https://afficix.com/og-image.png'],
    creator: 'Afficixo',
  },
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" aria-hidden="true" />}>
      <LoginClient />
    </Suspense>
  );
}
