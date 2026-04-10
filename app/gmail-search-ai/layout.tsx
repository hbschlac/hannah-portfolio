import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gmail Search AI — From Summary to Action | Hannah Schlacter",
  description:
    "Research + prototype: 3 validated hypotheses on what Gmail's AI bet needs to get right — summary accuracy, the action gap, and voice personalization. Built before the interview.",
  openGraph: {
    title: "Gmail Search AI — From Summary to Action",
    description:
      "Reddit evidence + live prototype showing the accuracy → action → voice chain Gmail needs to close.",
    type: "website",
  },
};

export default function GmailSearchAILayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
