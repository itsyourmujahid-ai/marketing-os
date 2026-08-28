import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";

import AppShell from "@/components/layout/AppShell";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://design-khajana.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Design Khajana — The Designers' Toolkit",
    template: "%s · Design Khajana",
  },
  description:
    "Eleven modular design studios and 68 tools for images, icons, colour, typography, layout, print and more.",
  keywords: [
    "design tools",
    "image editing",
    "colour palette",
    "typography",
    "grid system",
    "print design",
    "design khajana",
  ],
  openGraph: {
    type: "website",
    siteName: "Design Khajana",
    title: "Design Khajana — The Designers' Toolkit",
    description:
      "Eleven modular design studios and 68 tools for images, icons, colour, typography, layout, print and more.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Design Khajana — The Designers' Toolkit",
    description:
      "Eleven modular design studios and 68 tools ready for production.",
  },
};

export const viewport: Viewport = {
  themeColor: "#070910",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}