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

export const metadata: Metadata = {
  title: "CodeReview.ai",
  description: "AI-powered GitHub pull request reviews.",
  openGraph: {
    title: "CodeReview.ai",
    description: "AI-powered GitHub pull request reviews.",
    url: "https://codereviewai.vercel.app",
    siteName: "CodeReview.ai",
    images: [
      {
        url: "https://codereviewai.vercel.app/codereview-thumbnail.png",
        width: 1200,
        height: 630,
        alt: "CodeReview.ai Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeReview.ai",
    description: "AI-powered GitHub pull request reviews.",
    images: ["https://codereviewai.vercel.app/codereview-thumbnail.png"],
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
