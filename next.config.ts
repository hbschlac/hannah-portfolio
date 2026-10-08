import type { NextConfig } from "next";

// Static snapshots of Hannah's old Wix sites, stored as public/<site>/**/index.html.
// Array-form rewrites run after public files, so /<site>/_assets/* is served
// directly, and before dynamic routes, so the /[slug] resume route never sees these.
const WIX_ARCHIVES = ["biggerthanrun", "reva", "ruach2016"];

const nextConfig: NextConfig = {
  cacheComponents: true,
  async rewrites() {
    return [
      ...WIX_ARCHIVES.flatMap((site) => [
        { source: `/${site}`, destination: `/${site}/index.html` },
        { source: `/${site}/:path+`, destination: `/${site}/:path+/index.html` },
      ]),
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
      // Aliases for the Career Kit share page, for people who type the name they
      // heard ("career skills") instead of the kit's name.
      {
        source: "/career-skill",
        destination: "/career-kit",
      },
      {
        source: "/career-skills",
        destination: "/career-kit",
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
      // Anthropic Product Manager, Business Technology-tailored CV. Same 307
      // reasoning as /resume above.
      {
        source: "/resume-anthropic-business-technology",
        destination:
          "https://docs.google.com/document/d/1a8VHIojRfr2-Hx_wxlXJFov8e0gBF48SCKrgIvCdJBI/preview",
        permanent: false,
      },
      // AfterQuery Product Manager-tailored CV. Same 307 reasoning as /resume above.
      {
        source: "/resume-afterquery-pm",
        destination:
          "https://docs.google.com/document/d/1yLxaN2Pfo3LHqDdenWTPtziqfddAYchgSodXbTpzsu4/preview",
        permanent: false,
      },
      // HappyRobot Deployment Strategist-tailored CV. Same 307 reasoning as /resume above.
      {
        source: "/resume-happyrobot-deployment-strategist",
        destination:
          "https://docs.google.com/document/d/1IObjkvblynybYvMQVhYKobbe4H3s2rPN42Uz5-SQgQY/preview",
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
