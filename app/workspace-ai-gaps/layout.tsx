import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gemini Workspace AI — Opportunity Map | Hannah Schlacter",
  description: "Where users say Gemini for Workspace could win next — a data-driven opportunity analysis across 1,000+ public feedback signals.",
  openGraph: {
    title: "Gemini Workspace AI — Opportunity Map",
    description: "1,000+ user signals reveal where Gemini for Workspace has the biggest room to grow — and where the AI Foundations team can have the most impact.",
    type: "website",
    url: "https://schlacter.me/workspace-ai-gaps",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gemini Workspace AI — Opportunity Map",
    description: "1,000+ user signals reveal where Gemini for Workspace has the biggest room to grow.",
  },
};

export default function WorkspaceAILayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
