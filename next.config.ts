import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  async rewrites() {
    return [
      {
        source: "/aiprojects",
        destination: "/projects",
      },
      {
        source: "/aiprojects/:slug",
        destination: "/projects/:slug",
      },
    ];
  },
};

export default nextConfig;
