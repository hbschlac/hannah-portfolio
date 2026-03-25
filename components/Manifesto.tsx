"use client";

import { useState } from "react";

const sections = [
  {
    heading: "The bottleneck isn't the model. It's you.",
    body: "I went in thinking the limitation was what the model could engineer. When I hit my usage limit and upgraded my plan, I realized: removing the ceiling just exposed the real one. Nothing moves unless you call the play — there's no autopilot, no off-switch. And the longer a session runs, the more the model degrades, which means more handholding, not less. Two Sundays in a row, noon became 2am.",
  },
  {
    heading: "Built isn't the same as trustworthy.",
    body: `I wanted to scrape data. Claude refused — regulations. So I rephrased, again and again, until "for educational purposes" worked. No identity check. Just: proceeded. Another project, I asked about security before connecting it to my iMessages. Nothing — it started building anyway. Even when I added "include a security layer," what came back was code I can't read. It lives in a file on my laptop. I have no way to audit what's actually there. That gap — between what the model will build and what anyone can actually trust — is the one I keep coming back to.`,
  },
  {
    heading: "Even together, you're building alone.",
    body: "When something broke and I brought in my husband — a software engineer — to help, the problem wasn't that a CLAUDE.md didn't exist. Even if it had, it wouldn't have covered what he needed. A project has a clear end goal — you can hand someone a document. A product isn't like that. Versions on versions. Services built and rebuilt. Decisions reversed. Things broken, fixed, broken differently. That entire living history lived in my session only. I had no way to compress it, let alone hand it over. At team scale, that's not just inefficient — it's how things break without anyone noticing.",
  },
];

export default function Manifesto() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="max-w-2xl mx-auto px-6 pt-10 pb-6">
      <h1 className="text-xl font-medium tracking-tight mb-10 text-foreground">
        The Bottleneck Is Me
      </h1>
      <div className="flex flex-col gap-6">
        {sections.map((section, i) => (
          <div key={i}>
            <h2 className="text-sm font-medium mb-2 flex items-start gap-2">
              <span className="text-accent mt-px leading-none">✦</span>
              <span className="text-foreground">{section.heading}</span>
            </h2>
            {expanded && (
              <p className="text-sm leading-relaxed text-foreground/75 pl-5 border-l border-accent/30 ml-[1px] mt-2">
                {section.body}
              </p>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-6 text-xs text-muted/60 hover:text-foreground transition-colors flex items-center gap-1.5"
      >
        <span>{expanded ? "Collapse" : "Read more"}</span>
        <span className="text-accent">{expanded ? "↑" : "↓"}</span>
      </button>
    </section>
  );
}
