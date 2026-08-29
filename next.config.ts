import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/video-eraser",
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
