import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cohere Developer Experience — Three-Way Comparison | Hannah Schlacter",
  description:
    "How developers actually talk about Cohere vs OpenAI vs Anthropic. A live sentiment map across SDK, playground, docs, model selection, enterprise deployment, and pricing — built for Cohere's Platform Experience team.",
  openGraph: {
    title: "Cohere Developer Experience — Three-Way Comparison",
    description:
      "A live developer sentiment map comparing Cohere vs OpenAI vs Anthropic across the six surfaces that drive platform adoption.",
    type: "website",
    url: "https://schlacter.me/cohere-developer-experience",
  },
};

export default function CohereExperienceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
