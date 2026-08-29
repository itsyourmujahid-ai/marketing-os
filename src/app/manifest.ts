import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Marketing OS",
    short_name: "Marketing OS",
    description:
      "The operating system for modern marketing teams. Strategy, campaigns, content, leads, automation and analytics in one place.",
    start_url: "/",
    display: "standalone",
    background_color: "#070910",
    theme_color: "#070910",
    icons: [
      {
        src: "/icon",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}