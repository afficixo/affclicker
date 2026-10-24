import type { Metadata } from "next";
import PublishersClient from "./PublishersClient";
import PublicLayout from "@/components/layout/PublicLayout";

export const metadata: Metadata = {
  metadataBase: new URL('https://afficix.com'),
  title: "Publisher Platform — Earn With High-Paying CPC Offers | Afficix",
  description:
    "Join the Afficix publisher program to discover high-paying CPC offers, track clicks in real time, and monetize your traffic.",
  keywords: [
    "affiliate publishers",
    "publisher platform",
    "monetize traffic",
    "CPC offers",
    "click tracking",
    "performance marketing",
    "earn money online",
    "publisher program",
    "affiliate publisher",
    "traffic monetization platform",
    "high-paying offers",
    "real-time tracking",
  ],
  alternates: {
    canonical: "https://afficix.com/publishers",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Publisher Platform — Earn With High-Paying CPC Offers",
    description:
      "Join the Afficix publisher program. Discover high-paying CPC campaigns, track clicks in real time, and monetize your traffic.",
    type: "website",
    url: "https://afficix.com/publishers",
    siteName: "Afficix",
    locale: "en_US",
    images: [
      {
        url: "https://afficix.com/afficix-preview.png",
        secureUrl: "https://afficix.com/afficix-preview.png",
        width: 768,
        height: 768,
        alt: "Afficix Publisher Platform",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Publisher Platform — Earn With CPC Offers",
    description:
      "Join our publisher program, discover high-paying CPC offers, and start monetizing your traffic today.",
    images: ["https://afficix.com/afficix-preview.png"],
    creator: "@afficixo",
    site: "@afficixo",
  },
};

export default function PublishersPage() {
  return (
    <PublicLayout>
      <PublishersClient />
    </PublicLayout>
  );
}