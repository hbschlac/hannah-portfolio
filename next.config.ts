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
      // Google Consumer Shopping-tailored CV. Same 307 reasoning as /resume above.
      {
        source: "/resume-google-consumer-shopping",
        destination:
          "https://docs.google.com/document/d/13rjsdK48xh23ESC-6i9qHtfEWQlHtqqr7PUgXBwRIRc/preview",
        permanent: false,
      },
      // Rare Earth Rescue-tailored CV. Same 307 reasoning as /resume above.
      {
        source: "/resume-rare-earth-rescue",
        destination:
          "https://docs.google.com/document/d/1uU3DiZfeYK4ggszuKN1BXzh-0xTKJH44wSm2Q7TPxaE/preview",
        permanent: false,
      },
      // Memorable link to Bullet Bench, the resume builder. 307 on purpose, same
      // reasoning as the CV links above: the bench is a private Artifact, and if it
      // is ever republished to a new artifact this slug has to stay repointable.
      // NOTE: the redirect is public but the destination is not — signed into Claude
      // it opens the bench, anyone else hits an auth wall. If the bench is ever
      // switched to "anyone with link", remove this redirect first.
      {
        source: "/resumebuilder",
        destination: "https://claude.ai/artifact/RWLv53mteWtb4dmZ1qJSnf",
        permanent: false,
      },
      // Character-budget alias for the Google Consumer Shopping CV above, for
      // places with a hard character cap (a LinkedIn connection note is 300).
      // "schlacter.me/g" is 14 chars vs 44 for the descriptive slug. Same doc,
      // same 307 — if the slug above is ever repointed, repoint this one too.
      {
        source: "/g",
        destination:
          "https://docs.google.com/document/d/13rjsdK48xh23ESC-6i9qHtfEWQlHtqqr7PUgXBwRIRc/preview",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
