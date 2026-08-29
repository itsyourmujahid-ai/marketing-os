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
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://marketing-os-zeta-sage.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Marketing OS",
    template: "%s · Marketing OS",
  },
  description:
    "Marketing OS — the operating system for modern marketing teams. Strategy, campaigns, content, leads, automation and analytics in one place.",
  keywords: [
    "marketing operating system",
    "marketing automation",
    "campaign management",
    "content marketing",
    "lead management",
    "marketing analytics",
    "saas",
    "marketing os",
  ],
  openGraph: {
    type: "website",
    siteName: "Marketing OS",
    title: "Marketing OS",
    description:
      "The operating system for modern marketing teams. Strategy, campaigns, content, leads, automation and analytics in one place.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Marketing OS",
    description:
      "The operating system for modern marketing teams. Strategy, campaigns, content, leads, automation and analytics.",
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