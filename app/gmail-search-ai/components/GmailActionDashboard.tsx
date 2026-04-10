"use client";

import { useState } from "react";
import type { GmailActionSnapshot, Hypothesis } from "@/lib/gmail-action";
import { HeroSection } from "./HeroSection";
import { HypothesisCard } from "./HypothesisCard";
import { EvidenceDrawer } from "./EvidenceDrawer";
import { PrototypeSection } from "./PrototypeSection";

export function GmailActionDashboard({ snapshot }: { snapshot: GmailActionSnapshot }) {
  const [drawerHypothesis, setDrawerHypothesis] = useState<Hypothesis | null>(null);

  return (
    <div className="min-h-screen bg-white">
      <HeroSection snapshot={snapshot} />

      {/* Research section */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-6">
          <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Evidence</div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">3 hypotheses. All validated by users.</h2>
          <p className="text-gray-500 mt-2 text-sm max-w-xl">
            Each card shows real Reddit posts from Gmail users and AI email tool users. Click a post to read it on Reddit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {snapshot.hypotheses.map((h) => (
            <HypothesisCard
              key={h.id}
              hypothesis={h}
              onViewEvidence={setDrawerHypothesis}
            />
          ))}
        </div>
      </div>

      {/* Prototype section */}
      <PrototypeSection />

      {/* Evidence drawer */}
      {drawerHypothesis && (
        <EvidenceDrawer
          hypothesis={drawerHypothesis}
          onClose={() => setDrawerHypothesis(null)}
        />
      )}

      {/* Footer */}
      <div className="border-t border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-400">
          <div>
            Built by{" "}
            <a href="/" className="text-gray-600 hover:text-gray-900 font-medium">
              Hannah Schlacter
            </a>
            {" "}· Data from Reddit (public API, all posts linked)
          </div>
          <div className="flex gap-4">
            <a href="/gmail-search-ai/methodology" className="hover:text-gray-600">Methodology</a>
            <a href="/google-workspace-ai-feedback" className="hover:text-gray-600">Workspace AI Gaps</a>
          </div>
        </div>
      </div>
    </div>
  );
}
