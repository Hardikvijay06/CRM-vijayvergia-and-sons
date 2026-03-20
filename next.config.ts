import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.GITHUB_PAGES ? "/CRM-vijayvergia-and-sons" : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
