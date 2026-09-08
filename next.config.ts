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
  async redirects() {
    return [
      // Short link for sharing the general CV (e.g. in outreach and group chats).
      // Temporary (307) on purpose: points at the live Google Doc for now, so it
      // can be repointed to a PDF later without browsers having cached a 308.
      {
        source: "/resume",
        destination:
          "https://docs.google.com/document/d/1aM1xF-MEGK24j3lxLToqixFXC98B_FCeY74EXefkZig/preview",
        permanent: false,
      },
      // Crucibl-tailored CV. Same 307 reasoning as /resume above.
      {
        source: "/resume-crucibl",
        destination:
          "https://docs.google.com/document/d/1ru4oa-2gGhxLi9xcOs-o1XVc7DdBUWSLk5eMRS3sz1E/preview",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
