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
        source: "/aiprototypes",
        destination: "/projects",
      },
      {
        source: "/aiprototypes/:slug",
        destination: "/projects/:slug",
      },
      {
        source: "/AIprototypes",
        destination: "/projects",
      },
      {
        source: "/AIprototypes/:slug",
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
