import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  async rewrites() {
    return [
      // jamiesbach.schlacter.me — Jamie's Bach is served from a subdomain.
      // Map every request on that host to the existing /jamie-bach-2026 routes.
      {
        source: "/",
        has: [{ type: "host", value: "jamiesbach.schlacter.me" }],
        destination: "/jamie-bach-2026",
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "jamiesbach.schlacter.me" }],
        destination: "/jamie-bach-2026/:path*",
      },
      // Existing rewrites
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
      // Old canonical URL → new subdomain. Anyone with a saved link to
      // schlacter.me/jamie-bach-2026/* gets bounced to jamiesbach.schlacter.me/*.
      // Restricted to the apex/www host so the rewrite-served pages on the
      // subdomain don't loop.
      {
        source: "/jamie-bach-2026",
        has: [{ type: "host", value: "schlacter.me" }],
        destination: "https://jamiesbach.schlacter.me",
        permanent: true,
      },
      {
        source: "/jamie-bach-2026/:path*",
        has: [{ type: "host", value: "schlacter.me" }],
        destination: "https://jamiesbach.schlacter.me/:path*",
        permanent: true,
      },
      {
        source: "/jamie-bach-2026",
        has: [{ type: "host", value: "www.schlacter.me" }],
        destination: "https://jamiesbach.schlacter.me",
        permanent: true,
      },
      {
        source: "/jamie-bach-2026/:path*",
        has: [{ type: "host", value: "www.schlacter.me" }],
        destination: "https://jamiesbach.schlacter.me/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
