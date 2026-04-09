import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How LLMs Work — Interactive Explainer | Hannah Schlacter",
  description:
    "An interactive, visual guide to how large language models work — from text as numbers to the Transformer architecture. Built for curious non-engineers.",
  openGraph: {
    title: "How LLMs Work — Interactive Explainer",
    description:
      "See how ChatGPT, Claude, and Gemini actually process your words. No PhD required.",
    type: "website",
    url: "https://schlacter.me/llm-explainer",
  },
};

export default function LLMExplainerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
