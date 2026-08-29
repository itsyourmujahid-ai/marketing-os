import type { MetadataRoute } from "next";

import { sections } from "@/lib/catalog";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://video-eraser-bahwan-order-tracking.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: siteUrl,
      changeFrequency: "monthly",
      priority: 1,
      lastModified,
    },
    ...sections.map((section) => ({
      url: `${siteUrl}/${section.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
      lastModified,
    })),
  ];
}