import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Design Khajana — The Designers' Toolkit",
    short_name: "Design Khajana",
    description:
      "Eleven modular design studios and 68 tools for images, icons, colour, typography, layout, print and more.",
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