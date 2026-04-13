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
      {
        source: "/google-workspace-ai-feedback",
        destination: "/workspace-ai-gaps",
      },
      {
        source: "/gmail-search-overview",
        destination: "/gmail-search-ai",
      },
      {
        source: "/twitch-community-intelligence",
        destination: "/twitch-community",
      },
    ];
  },
};

export default nextConfig;
