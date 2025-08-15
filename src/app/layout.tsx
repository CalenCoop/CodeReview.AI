import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://codereviewai.vercel.app";
const v = "v=1";
const gifUrl = `${siteUrl}/codereview-thumbnail.gif?${v}`;
const pngUrl = `${siteUrl}/codereview-thumbnail.png?${v}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  alternates: { canonical: siteUrl },
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
        url: gifUrl,
        width: 1200,
        height: 630,
        alt: "CodeReview.ai Preview",
        type: "image/gif",
      },
      {
        url: pngUrl,
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
    images: [gifUrl, pngUrl],
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
