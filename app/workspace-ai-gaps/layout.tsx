import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gemini Workspace AI Gap Analysis | Hannah Schlacter",
  description: "User-driven analysis of Gemini for Google Workspace pain points, competitive alternatives, and strategic opportunities for the AI Foundations team.",
  openGraph: {
    title: "Gemini Workspace AI Gap Analysis",
    description: "Real user feedback reveals where Gemini for Workspace falls short — and where the AI Foundations team should focus next.",
    type: "website",
    url: "https://schlacter.me/workspace-ai-gaps",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gemini Workspace AI Gap Analysis",
    description: "Real user feedback reveals where Gemini for Workspace falls short.",
  },
};

export default function WorkspaceAILayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
