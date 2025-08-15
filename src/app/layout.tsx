import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://codereviewai.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "CodeReview.ai",
  description: "AI-powered GitHub pull request reviews.",
  openGraph: {
    title: "CodeReview.ai",
    description: "AI-powered GitHub pull request reviews.",
    url: siteUrl,
    siteName: "CodeReview.ai",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: `${siteUrl}/codereview-thumbnail.gif`,
        width: 1200,
        height: 630,
        alt: "CodeReview.ai Preview",
        type: "image/gif",
      },
      {
        url: `${siteUrl}/codereview-thumbnail.png`,
        width: 1200,
        height: 630,
        alt: "CodeReview.ai Preview (static fallback)",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeReview.ai",
    description: "AI-powered GitHub pull request reviews.",
    images: [
      `${siteUrl}/codereview-thumbnail.gif`,
      `${siteUrl}/codereview-thumbnail.png`,
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
